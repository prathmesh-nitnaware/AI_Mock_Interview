import React from "react";

// Context Providers
import { AuthProvider } from "./context/AuthContext";

// Routing
import AppRoutes from "./routes/AppRoutes";

// Styles
import "./styles/global.css";
import "./styles/theme.css";
import "./styles/layout.css";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      {/* Premium Dark Theme is handled via global.css. 
          'app-root' serves as the primary container for all views.
      */}
      <div className="app-root">
         <AppRoutes />
      </div>
    </AuthProvider>
  );
}

export default App;