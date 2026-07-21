import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";

const MINUTE = 1000 * 60;

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * MINUTE,
      gcTime: 30 * MINUTE,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retryOnMount: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>,
);
