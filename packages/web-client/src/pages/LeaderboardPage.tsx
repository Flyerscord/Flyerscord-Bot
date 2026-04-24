import { trpc } from "../trpc";

export default function LeaderboardPage() {
  const { data, isLoading, error } = trpc.leaderboard.get.useQuery();

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <span className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">Failed to load leaderboard.</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full">
          <thead>
            <tr>
              <th>Rank</th>
              <th>User</th>
              <th>Level</th>
              <th>Total XP</th>
              <th>Messages</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((entry) => (
              <tr key={entry.userId}>
                <td className="font-bold text-lg">
                  {entry.rank <= 3 ? (
                    <span className={entry.rank === 1 ? "text-yellow-400" : entry.rank === 2 ? "text-gray-400" : "text-orange-400"}>
                      #{entry.rank}
                    </span>
                  ) : (
                    `#${entry.rank}`
                  )}
                </td>
                <td>
                  <div className="flex items-center gap-3">
                    {entry.avatarUrl ? (
                      <div className="avatar">
                        <div className="w-8 rounded-full">
                          <img src={entry.avatarUrl} alt={entry.username} />
                        </div>
                      </div>
                    ) : (
                      <div className="avatar placeholder">
                        <div className="bg-neutral text-neutral-content rounded-full w-8">
                          <span className="text-xs">{entry.username[0]?.toUpperCase()}</span>
                        </div>
                      </div>
                    )}
                    <span className="font-medium">{entry.username}</span>
                  </div>
                </td>
                <td>
                  <div className="badge badge-primary">{entry.level}</div>
                </td>
                <td>{entry.totalXp.toLocaleString()}</td>
                <td>{entry.messageCount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
