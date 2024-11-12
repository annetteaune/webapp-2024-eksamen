import { useUsers } from "@/hooks/useUsers";

export default function UsersList() {
  const { users, isLoading } = useUsers();

  if (isLoading) {
    return (
      <aside
        data-testid="enrollments"
        className="border-l border-slate-200 pl-6"
      >
        <h3 className="mb-4 text-base font-bold">Brukere</h3>
        <p>Laster inn brukere...</p>
      </aside>
    );
  }

  return (
    <aside data-testid="enrollments" className="border-l border-slate-200 pl-6">
      <h3 className="mb-4 text-base font-bold">Brukere</h3>
      {users && users.length > 0 ? (
        <ul className="space-y-2">
          {users.map((user) => (
            <li key={user.id} className="capitalize">
              {user.name}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-base">Ingen brukere</p>
      )}
    </aside>
  );
}
