export function generateUniqueId(fullName) {
  // Get initials (first letters of each word, uppercase)
  const initials = fullName
    .split(" ")
    .filter((word) => word.length > 0)
    .map((word) => word[0].toUpperCase())
    .join("");

  // Generate timestamp component (last 4 digits of current milliseconds)
  const timestamp = Date.now().toString();
  const timestampComponent = timestamp.slice(-4);

  // Generate random component (4 alphanumeric characters)
  const randomChars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let randomComponent = "";
  for (let i = 0; i < 4; i++) {
    randomComponent += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }

  // Combine all components: initials + 2 from timestamp + 4 random chars
  const uniqueId = initials + timestampComponent.slice(0, 2) + randomComponent;

  return uniqueId;
}
