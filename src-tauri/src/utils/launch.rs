use serde::{Deserialize, Serialize};
use std::path::Path;
use std::process::Command;
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct LaunchResult {
    success: bool,
    message: String,
}

/// 启动游戏
///
/// # Arguments
///
/// * `game_path` - 游戏可执行文件的路径
/// * `args` - 可选的游戏启动参数
///
/// # Returns
///
/// 启动结果，包含成功标志和消息
#[command]
pub async fn launch_game(
    game_path: String,
    args: Option<Vec<String>>,
) -> Result<LaunchResult, String> {
    // 获取游戏可执行文件的目录
    let game_dir = match Path::new(&game_path).parent() {
        Some(dir) => dir,
        None => return Err("无法获取游戏目录路径".to_string()),
    };

    // 获取游戏可执行文件名
    let exe_name = match Path::new(&game_path).file_name() {
        Some(name) => name,
        None => return Err("无法获取游戏可执行文件名".to_string()),
    };

    // 创建命令，设置工作目录为游戏所在目录
    let mut command = Command::new(&game_path);
    command.current_dir(game_dir);

    if let Some(arguments) = args {
        command.args(arguments);
    }

    match command.spawn() {
        Ok(_) => Ok(LaunchResult {
            success: true,
            message: format!(
                "成功启动游戏: {}，工作目录: {:?}",
                exe_name.to_string_lossy(),
                game_dir
            ),
        }),
        Err(e) => Err(format!("启动游戏失败: {}，目录: {:?}", e, game_dir)),
    }
}

#[command]
pub async fn open_directory(dir_path: String) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        let _status = Command::new("explorer")
            .arg(&dir_path)
            .spawn()
            .map_err(|e| e.to_string())?;
        Ok(())
    }
}
