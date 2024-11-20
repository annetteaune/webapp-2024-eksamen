import BookingsAdminPage from "@/features/admin/components/BookingsAdminPage";

type Params = {
  slug: string;
};

export default function BookingsAdmin({ params }: { params: Params }) {
  return (
    <>
      <BookingsAdminPage params={params} />
    </>
  );
}
