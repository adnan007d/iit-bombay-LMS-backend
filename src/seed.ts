import sql from "@/db";
import { hashSync } from "bcrypt";

const numberOfAuthors = 10;
const numberOfBooksPerAuthor = 10;
const numberOfMembers = 5;
const numberOfLibrarian = 2;

const books = [];

for (let i = 0; i < numberOfAuthors; ++i) {
  for (let j = 0; j < numberOfBooksPerAuthor; ++j) {
    books.push({
      title: `Book ${books.length + 1}`,
      author: `Author ${i + 1}`,
    });
  }
}

const users = [];

for (let i = 0; i < numberOfMembers; ++i) {
  users.push({
    username: `user${i + 1}`,
    email: `user${i + 1}@gmail.com`,
    password: hashSync("User@123", 10),
    role: "MEMBER",
  });
}

for (let i = 0; i < numberOfLibrarian; ++i) {
  users.push({
    username: `admin${i + 1}`,
    email: `admin${i + 1}@gmail.com`,
    password: hashSync("Admin@123", 10),
    role: "LIBRARIAN",
  });
}

Promise.all([
  sql`
INSERT INTO books ${sql(books)}
`,
  sql`
INSERT INTO users ${sql(users)}
`,
]).then(() => {
  console.log("Data seeded");
  process.exit(0);
});
