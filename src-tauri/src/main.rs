#![cfg_attr(
  all(not(debug_assertions), target_os = "windows"),
  windows_subsystem = "windows"
)]

use std::process::Command;

fn main() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![perform_hid_operation])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
fn perform_hid_operation(invoke_type: String) {
  if invoke_type == "keyboard" {
    
  }
}