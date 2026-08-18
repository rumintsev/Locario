'use server';

export async function fetchEndpoint(endpoint: string) {
	const path = (process.env.DOMAIN || 'http://localhost:3001') + endpoint;
	console.log(path)
  const res = await fetch(path, {
    next: { revalidate: parseInt(process.env.REVALIDATE || '1') }
  });
  if (!res.ok) {
    console.log(`Fetch error`)
  }
  return res.json();
};