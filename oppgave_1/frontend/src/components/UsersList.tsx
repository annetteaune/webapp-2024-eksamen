import { users } from "@/data/data";
import { User } from "@/interfaces/types";

export default function UsersList() {
  return (
    <aside data-testid="enrollments" className="border-l border-slate-200 pl-6">
      <h3 className="mb-4 text-base font-bold">Brukere</h3>
      {users && users.length > 0 ? (
        <ul className="space-y-2">
          {users.map((user: User) => (
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
