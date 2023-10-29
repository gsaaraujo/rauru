import { PrismaClient } from '@prisma/client';

const prismaClient = new PrismaClient();

async function main() {
  await prismaClient.$transaction([prismaClient.schedule.deleteMany(), prismaClient.appointment.deleteMany()]);
  await prismaClient.$transaction([
    prismaClient.schedule.create({
      data: {
        id: '821339f9-49de-4714-9fa4-db72dcb29eb5',
        doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
        price: 24,
        timeSlots: ['22:15'],
        daysOfAvailability: ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'],
      },
    }),
    // prismaClient.appointment.create({
    //   data: {
    //     id: '667c7aa3-1929-4fb3-a1ae-0535d42396de',
    //     doctorId: '6bf34422-622c-4c58-a751-4614980fce03',
    //     patientId: 'b957aa4b-654e-47b0-a935-0923877d57a7',
    //     status: 'PENDING',
    //     price: 120,
    //     date: new Date('2100-10-15T00:00:00.000Z'),
    //   },
    // }),
  ]);
}

main()
  .then(async () => {
    await prismaClient.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prismaClient.$disconnect();
    process.exit(1);
  });
