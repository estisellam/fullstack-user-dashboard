export default function Home() {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  return (
    <div>
      <h1>Welcome {user?.name}</h1>
    </div>
  );
}