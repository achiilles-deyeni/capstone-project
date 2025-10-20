import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function ClerkProviderWithRoutes({ children }) {
  if (!PUBLISHABLE_KEY) {
    // eslint-disable-next-line no-console
    console.warn(
      "VITE_CLERK_PUBLISHABLE_KEY is not set. Clerk auth will be disabled in this environment."
    );
    return <BrowserRouter>{children}</BrowserRouter>;
  }

  return (
    <ClerkProvider publishableKey={PUBLISHABLE_KEY}>
      <BrowserRouter>{children}</BrowserRouter>
    </ClerkProvider>
  );
}
