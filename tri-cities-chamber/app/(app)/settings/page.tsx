/**
 * Page at /settings. There are no settings yet, so this is a placeholder that keeps the
 * sidebar "Settings" link from landing on a 404 page.
 */
// export default function SettingsPage() {
//   return (
//     <div className="grid gap-2">
//       <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
//       <p className="text-sm text-muted-foreground">Settings are coming soon.</p>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent } from "react";
import { User, Plus, Sun, Moon, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [photo, setPhoto] = useState("");
  const [theme, setTheme] = useState("light");
  const [message, setMessage] = useState("");

  // Load settings saved in the browser
  useEffect(() => {
    setUsername(localStorage.getItem("username") || "");
    setEmail(localStorage.getItem("email") || "");
    setPhoto(localStorage.getItem("profileImage") || "");

    const savedTheme = localStorage.getItem("theme") || "light";
    setTheme(savedTheme);

    document.documentElement.classList.toggle(
      "dark",
      savedTheme === "dark"
    );
  }, []);

  // Change between light and dark mode
  function changeTheme(newTheme: string) {
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);

    document.documentElement.classList.toggle(
      "dark",
      newTheme === "dark"
    );
  }

  // Upload a profile picture
  function changePhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/") || file.size > 1024 * 1024) {
      setMessage("Please choose an image smaller than 1 MB.");
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === "string") {
        setPhoto(reader.result);
        setMessage("");
      }
    };

    reader.readAsDataURL(file);
  }

  // Save settings
  function saveSettings() {
    try {
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("profileImage", photo);
      localStorage.setItem("theme", theme);

      setPassword("");

      if (password) {
        setMessage(
          "Profile saved. Password changes are not available yet."
        );
      } else {
        setMessage("Settings updated successfully!");
      }
    } catch {
      setMessage("Could not save settings. Please try a smaller photo.");
    }
  }

  return (
    <div className="text-gray-900 dark:text-white">
      <div className="mx-auto max-w-2xl">
        {/* Main settings card */}
        <div className="w-full rounded-xl border border-gray-300 bg-[#fafbf7] p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900 md:p-6">

          {/* Profile section */}
          <div id="profile" className="mb-5 flex items-center gap-3">
            <div className="relative">
              <label
                htmlFor="profile-photo"
                className="block cursor-pointer"
                title="Change profile picture"
              >
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-indigo-100 dark:bg-slate-700">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Profile picture"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User size={26} className="text-indigo-700 dark:text-white" />
                  )}
                </div>

                <span className="absolute -bottom-1 -right-1 rounded-full bg-teal-600 p-1 text-white">
                  <Plus size={12} />
                </span>
              </label>

              <input
                id="profile-photo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={changePhoto}
              />
            </div>

            <h2 className="text-lg font-semibold">Profile</h2>
          </div>

          {/* Username */}
          <div className="mb-4">
            <Label htmlFor="username" className="mb-2 block text-sm">
              Username
            </Label>

            <Input
              id="username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Enter username"
              className="border-gray-300 bg-transparent dark:border-slate-600"
            />
          </div>

          {/* Email */}
          <div className="mb-4">
            <Label htmlFor="email" className="mb-2 block text-sm">
              Email
            </Label>

            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email"
              className="border-gray-300 bg-transparent dark:border-slate-600"
            />
          </div>

          {/* Password */}
          <div className="mb-5">
            <Label htmlFor="password" className="mb-2 block text-sm">
              Password
            </Label>

            <Input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter new password"
              className="border-gray-300 bg-transparent dark:border-slate-600"
            />

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Password changes will be available when login is connected.
            </p>
          </div>

          {/* Appearance */}
          <div id="appearance" className="mb-8">
            <h3 className="mb-1 text-sm font-semibold">Theme</h3>

            <p className="mb-4 text-xs text-gray-500 dark:text-gray-400">
              Select the theme for your dashboard
            </p>

            <div className="flex flex-wrap gap-4">

              {/* Light theme */}
              <button
                type="button"
                onClick={() => changeTheme("light")}
                aria-pressed={theme === "light"}
                className="w-32 text-center"
              >
                <div
                  className={`rounded-lg border-2 bg-gray-100 p-2 ${
                    theme === "light"
                      ? "border-teal-600"
                      : "border-gray-300"
                  }`}
                >
                  <div className="rounded bg-white p-2">
                    <div className="mb-2 h-2 w-16 rounded bg-gray-200" />
                    <div className="h-2 w-20 rounded bg-gray-200" />
                  </div>

                  <div className="mt-2 rounded bg-white p-2">
                    <div className="mb-2 h-2 w-14 rounded bg-gray-200" />
                    <div className="h-2 w-20 rounded bg-gray-200" />
                  </div>

                  <div className="mt-2 rounded bg-white p-2">
                    <div className="h-2 w-16 rounded bg-gray-200" />
                  </div>
                </div>

                <span className="mt-2 flex items-center justify-center gap-1 text-sm">
                  <Sun size={15} />
                  Light
                </span>
              </button>

              {/* Dark theme */}
              <button
                type="button"
                onClick={() => changeTheme("dark")}
                aria-pressed={theme === "dark"}
                className="w-32 text-center"
              >
                <div
                  className={`rounded-lg border-2 bg-slate-950 p-2 ${
                    theme === "dark"
                      ? "border-teal-500"
                      : "border-gray-300"
                  }`}
                >
                  <div className="rounded bg-slate-800 p-2">
                    <div className="mb-2 h-2 w-16 rounded bg-slate-500" />
                    <div className="h-2 w-20 rounded bg-slate-500" />
                  </div>

                  <div className="mt-2 rounded bg-slate-800 p-2">
                    <div className="mb-2 h-2 w-14 rounded bg-slate-500" />
                    <div className="h-2 w-20 rounded bg-slate-500" />
                  </div>

                  <div className="mt-2 rounded bg-slate-800 p-2">
                    <div className="h-2 w-16 rounded bg-slate-500" />
                  </div>
                </div>

                <span className="mt-2 flex items-center justify-center gap-1 text-sm">
                  <Moon size={15} />
                  Dark
                </span>
              </button>
            </div>
          </div>

          {/* Save button */}
          <Button
            type="button"
            onClick={saveSettings}
            className="gap-2 bg-[#168a91] text-white hover:bg-[#116e74]"
          >
            <Save size={16} />
            Update Settings
          </Button>

          {message && (
            <p
              role="status"
              className="mt-3 text-sm text-teal-700 dark:text-teal-300"
            >
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
