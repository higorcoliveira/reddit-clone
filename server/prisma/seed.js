import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function seed() {
    await prisma.post.deleteMany();
    await prisma.user.deleteMany();
    const john = await prisma.user.create({ data: { name: 'John'}});
    const susan = await prisma.user.create({ data: { name: 'Susan'}});

    const post1 = await prisma.post.create({ 
        data: {
            body: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
            title: "First Post"
        }
    });

    const comment1 = await prisma.comment.create({ 
        data: {
            message: "First!",
            userId: john.id,
            postId: post1.id
        }
    });

    const comment2 = await prisma.comment.create({ 
        data: {
            parentId: comment1.id,
            message: "Another comment...",
            userId: susan.id,
            postId: post1.id
        }
    });
}

seed();
