import { ClerkProvider } from "@clerk/clerk-react";
import { BrowserRouter } from "react-router-dom";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export default function ClerkProviderWithRoutes({ children }) {
  // In development it's common to not have 3rd-party env values set.
  // Instead of throwing and causing a blank page, gracefully fall back
  // to rendering the routes without Clerk. This lets the UI render
  // while still warning the developer that the publishable key is missing.
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
