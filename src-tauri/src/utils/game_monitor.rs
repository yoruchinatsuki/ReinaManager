use serde_json::json;
use std::{
    thread,
    time::{Duration, SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Emitter, Runtime};

#[cfg(target_os = "windows")]
use windows::Win32::{
    Foundation::CloseHandle,
    System::Diagnostics::ToolHelp::{
        CreateToolhelp32Snapshot, Process32First, Process32Next, PROCESSENTRY32, TH32CS_SNAPPROCESS,
    },
    System::Threading::{
        GetExitCodeProcess, OpenProcess, PROCESS_QUERY_INFORMATION, PROCESS_VM_READ,
    },
};

// 获取当前时间戳（秒）
fn get_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

// 监控游戏进程
#[tauri::command]
pub async fn monitor_game<R: Runtime>(app_handle: AppHandle<R>, game_id: u32, process_id: u32) {
    // 在新线程中启动监控，避免阻塞Tauri事件循环
    let app_handle_clone = app_handle.clone();
    thread::spawn(move || {
        if let Err(e) = run_game_monitor(app_handle_clone, game_id, process_id) {
            eprintln!("游戏监控错误: {}", e);
        }
    });
}

// 实际的监控循环
fn run_game_monitor<R: Runtime>(
    app_handle: AppHandle<R>,
    game_id: u32,
    mut process_id: u32,
) -> Result<(), String> {
    let mut accumulated_seconds = 0;
    let start_time = get_timestamp();
    let original_process_id = process_id; // 保存原始进程ID

    // 打印调试信息，便于排查
    println!("开始监控游戏进程: ID={}, PID={}", game_id, process_id);

    // 通知前端游戏会话开始
    app_handle
        .emit(
            "game-session-started",
            json!({
                "gameId": game_id,
                "processId": process_id,
                "startTime": start_time,
            }),
        )
        .map_err(|e| e.to_string())?;

    let mut consecutive_failures = 0;
    let max_failures = 2; // 连续2次检测失败视为进程已结束
    let mut switched_process = false; // 是否已经切换到子进程

    // 监控循环
    loop {
        let process_running = is_process_running(process_id);

        if !process_running {
            consecutive_failures += 1;

            if consecutive_failures >= max_failures {
                println!("进程 {} 已确认结束", process_id);

                // 检查是否有子进程并且我们还没有切换过
                if !switched_process {
                    let child_processes = get_child_processes(original_process_id);

                    // 找到一个运行中的子进程
                    for &child_pid in &child_processes {
                        if is_process_running(child_pid) {
                            println!("检测到子进程 {}，继续监控", child_pid);
                            process_id = child_pid;
                            consecutive_failures = 0;
                            switched_process = true;
                            break;
                        }
                    }

                    // 如果成功切换到子进程，继续循环
                    if consecutive_failures == 0 {
                        continue;
                    }
                }

                // 没有找到活跃的子进程或已经切换过，真正结束
                break;
            }
        } else {
            consecutive_failures = 0; // 重置失败计数

            if is_window_foreground(process_id) {
                accumulated_seconds += 1;

                // 每30秒通知一次前端
                if accumulated_seconds % 30 == 0 {
                    let minutes = accumulated_seconds / 60;

                    // 发送更新事件到前端
                    app_handle
                        .emit(
                            "game-time-update",
                            json!({
                                "gameId": game_id,
                                "totalMinutes": minutes,
                                "totalSeconds": accumulated_seconds,
                                "startTime": start_time,
                                "currentTime": get_timestamp(),
                                "processId": process_id
                            }),
                        )
                        .map_err(|e| e.to_string())?;
                }
            }
        }

        // 短暂休眠，减少CPU使用
        thread::sleep(Duration::from_secs(1));
    }

    // 游戏结束，发送最终统计
    let end_time = get_timestamp();
    let total_minutes = accumulated_seconds / 60;
    let remainder_seconds = accumulated_seconds % 60;

    // 四舍五入计算最终分钟数
    let final_minutes = if remainder_seconds >= 30 {
        total_minutes + 1
    } else {
        total_minutes
    };

    println!(
        "游戏进程结束: ID={}, PID={}, 总时间={}分钟{}秒",
        game_id, process_id, total_minutes, remainder_seconds
    );

    // 发送会话结束事件
    app_handle
        .emit(
            "game-session-ended",
            json!({
                "gameId": game_id,
                "startTime": start_time,
                "endTime": end_time,
                "totalMinutes": final_minutes,
                "totalSeconds": accumulated_seconds,
                "processId": process_id
            }),
        )
        .map_err(|e| e.to_string())?;

    Ok(())
}

// 检查进程是否在运行
fn is_process_running(pid: u32) -> bool {
    #[cfg(target_os = "windows")]
    {
        unsafe {
            // 尝试打开进程
            let handle_result =
                OpenProcess(PROCESS_QUERY_INFORMATION | PROCESS_VM_READ, false, pid);

            // 检查句柄是否有效
            if handle_result.is_err() {
                return false; // 无法打开进程
            }

            let handle = handle_result.unwrap();
            if handle.is_invalid() {
                CloseHandle(handle).ok();
                return false;
            }

            // 获取退出码
            let mut exit_code: u32 = 0;
            // 修复 as_bool() 问题
            let exit_code_result = GetExitCodeProcess(handle, &mut exit_code);
            let exit_code_success = exit_code_result.is_ok();
            CloseHandle(handle).ok();

            // 检查是否成功获取退出码，并且进程仍在运行
            if !exit_code_success {
                return false;
            }

            // 使用常量值而不是直接比较STILL_ACTIVE
            // STILL_ACTIVE通常是值为259(0x103)的常量
            exit_code == 259 // STILL_ACTIVE的数值
        }
    }

    #[cfg(not(target_os = "windows"))]
    {
        std::path::Path::new(&format!("/proc/{}", pid)).exists()
    }
}

// 检查进程窗口是否在前台
fn is_window_foreground(pid: u32) -> bool {
    #[cfg(target_os = "windows")]
    {
        // 1. 宽松匹配：只要进程在运行，我们就认为它是活跃的
        // 这适用于某些全屏游戏或特殊应用
        if is_process_running(pid) {
            return true; // 可以根据实际需求调整这个策略
        }

        // 2. 检查子进程
        let child_pids = get_child_processes(pid);
        for &child_pid in &child_pids {
            if is_process_running(child_pid) {
                return true; // 可以根据实际需求调整这个策略
            }
        }

        false
    }

    #[cfg(not(target_os = "windows"))]
    {
        true // 非Windows系统暂时默认为前台
    }
}

// 检查并获取指定进程的子进程
#[cfg(target_os = "windows")]
fn get_child_processes(parent_pid: u32) -> Vec<u32> {
    let mut child_pids = Vec::new();

    unsafe {
        // 创建系统进程快照
        let snapshot = match CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0) {
            Ok(handle) => handle,
            Err(_) => return child_pids,
        };

        if snapshot.is_invalid() {
            return child_pids;
        }

        // 初始化进程条目结构
        let mut process_entry = PROCESSENTRY32 {
            dwSize: std::mem::size_of::<PROCESSENTRY32>() as u32,
            ..Default::default()
        };

        // 获取第一个进程 - 修复 as_bool 问题
        // 先尝试直接检查布尔值
        let first_result = Process32First(snapshot, &mut process_entry);
        if first_result.is_err() {
            // 使用 is_ok() 替代 as_bool()
            CloseHandle(snapshot).ok();
            return child_pids;
        }

        // 遍历所有进程
        loop {
            // 检查此进程的父进程ID是否等于我们的父进程
            if process_entry.th32ParentProcessID == parent_pid {
                child_pids.push(process_entry.th32ProcessID);
            }

            // 移动到下一个进程 - 修复 as_bool 问题
            let next_result = Process32Next(snapshot, &mut process_entry);
            if next_result.is_err() {
                // 使用 is_ok() 替代 as_bool()
                break;
            }
        }

        CloseHandle(snapshot).ok();
    }

    child_pids
}

#[cfg(not(target_os = "windows"))]
fn get_child_processes(_parent_pid: u32) -> Vec<u32> {
    // Linux实现可以读取/proc/{pid}/task/{tid}/children
    Vec::new()
}
