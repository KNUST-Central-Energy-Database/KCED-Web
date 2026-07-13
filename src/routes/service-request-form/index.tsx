import { createFileRoute } from "@tanstack/react-router";
import { ServiceRequestScreen } from "@/features/service_request/components/ServiceRequestScreen";

export const Route = createFileRoute("/service-request-form/")({
  component: ServiceRequestScreen,
});
