import React from "react";

// Context Providers
import { AuthProvider } from "./context/AuthContext";

// Routing
import AppRoutes from "./routes/AppRoutes";

// Styles
// Note: order matters - global/theme variables should come first
import "./styles/global.css";
import "./styles/theme.css";
import "./styles/layout.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      {/* We've removed ThemeProvider because the app is now 
          hardcoded to a premium dark theme via global.css.
      */}
      <div className="app-root">
         {/* AppRoutes handles the logic for Public vs Private pages */}
         <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;