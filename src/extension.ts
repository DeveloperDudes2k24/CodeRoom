import * as vscode from "vscode";
import { VsChatSidebarProvider } from "./vsChatSidebarProvider";

export function activate(context: vscode.ExtensionContext) {
  const vsChatSidebarProvider = new VsChatSidebarProvider(context.extensionUri);

  let sidebar = vscode.window.registerWebviewViewProvider(
    "vschat-sidebar.view",
    vsChatSidebarProvider
  );

  context.subscriptions.push(sidebar);
}

export function deactivate() {}