
async function testGenerate() {
  const payload = {
    role: "Frontend Developer",
    level: "Junior",
    techstack: ["React", "TypeScript", "Tailwind CSS"],
    type: "Technical",
    amount: 3,
    userId: "test-user-id",
  };

  try {
    const response = await fetch("http://localhost:3000/api/vapi/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Success:", data);
  } catch (error) {
    console.error("Error:", error);
  }
}

testGenerate();
