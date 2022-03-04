import React from "react";
import { AppProvider } from "./src/hooks";
import { Routes } from "./src/routes";

export default function App() {
  return (
    <AppProvider>
      <Routes />
    </AppProvider>
  );
}
