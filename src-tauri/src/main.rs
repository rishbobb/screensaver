#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

#[cfg(debug_assertions)]
#[cfg(target_os = "macos")]
embed_plist::embed_info_plist!("../Info.plist");

use std::process::Command;
use std::path::Path;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![hide])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn hide() {
  if std::env::consts::OS == "macos" {
    Command::new("open")
      .arg("https://classroom.google.com/")
      .spawn();
  }
  if std::env::consts::OS == "windows" {
    Command::new("explorer")
      .arg("https://classroom.google.com/")
      .spawn();
  }
  if std::env::consts::OS == "linux" {
    Command::new("xdg-open")
      .arg("https://classroom.google.com/")
      .spawn();
  }
}