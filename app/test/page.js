export default function TestPage() {
  return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-presence-dark via-presence-accent2 to-presence-accent text-presence-light p-8">
       <div className="text-center">
        <h1 className="text-4xl font-bold text-presence-accent mb-4">
          ✅ Tailwind & Presence Colors Active
        </h1>
        <p className="text-lg text-presence-light/80">
          If you see a dark gradient and this accent color — Tailwind is working.
        </p>
      </div>
    </div>
  );
}
