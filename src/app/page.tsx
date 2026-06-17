import { ApplicationsList } from "@/components/ApplicationsList";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Applications</h1>
        <p className="mt-1 text-sm text-gray-600">
          Track companies you&apos;ve applied to and where each application stands.
        </p>
      </div>
      <ApplicationsList />
    </div>
  );
}
