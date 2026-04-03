import Link from "next/link";
import { AGENTS } from "@/app/_lib/constants";

export default function Home() {
  const agents = Object.values(AGENTS);

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">ZeroClaw Agents</h1>
      <div className="space-y-4">
        {agents.map((agent) => (
          <Link
            key={agent.slug}
            href={`/chat/${agent.slug}`}
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <h2 className="text-lg font-semibold">{agent.name}</h2>
            <p className="text-gray-600 text-sm">{agent.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
