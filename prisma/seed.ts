import { Weekday } from "@prisma/client";
import { prisma } from "../src/server/db";

const exercises = [
  { name: "Supino Reto", category: "Peito" },
  { name: "Supino Inclinado", category: "Peito" },
  { name: "Supino Declinado", category: "Peito" },
  { name: "Crucifixo", category: "Peito" },
  { name: "Voador", category: "Peito" },

  { name: "Remada Curvada", category: "Dorsal" },
  { name: "Remada Alta", category: "Dorsal" },
  { name: "Remada Baixa", category: "Dorsal" },

  { name: "Agachamento", category: "Perna" },
  { name: "Leg Press", category: "Perna" },
  { name: "Cadeira Extensora", category: "Perna" },
  { name: "Cadeira Flexora", category: "Perna" },
  { name: "Cadeira Adutora", category: "Perna" },
  { name: "Cadeira Abdutora", category: "Perna" },

  { name: "Rosca Direta", category: "Bíceps" },
  { name: "Rosca Alternada", category: "Bíceps" },
  { name: "Rosca Martelo", category: "Bíceps" },

  { name: "Tríceps Testa", category: "Tríceps" },
  { name: "Tríceps Pulley", category: "Tríceps" },
  { name: "Tríceps Corda", category: "Tríceps" },

  { name: "Crucifixo Invertido", category: "Ombro" },
  { name: "Elevação Frontal", category: "Ombro" },
  { name: "Elevação Lateral", category: "Ombro" },

  { name: "Abdominal", category: "Abdominal" },
  { name: "Prancha", category: "Abdominal" },
  { name: "Abdominal Declinado", category: "Abdominal" },

  { name: "Esteira", category: "Cardio" },
  { name: "Bicicleta", category: "Cardio" },
  { name: "Caminhada", category: "Cardio" },
];

async function seedExercises() {
  console.log("Seeding exercises...");

  try {
    await prisma.exercise.deleteMany();
    return prisma.exercise.createMany({ data: exercises });
  } catch (error) {
    console.log("Exercises already seeded");
  }
}

const profiles = [
  { email: "jartur.dev@gmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "joao.moura59346@gmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "guilherme.melo36451@alunos.ufersa.edu.br", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "ournews@verizon.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "simone@yahoo.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "giafly@msn.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "syncnine@comcast.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "munjal@gmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "goldberg@outlook.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "alias@live.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "hachi@gmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "cremonini@icloud.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "hutton@optonline.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "scottlee@optonline.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "moxfulder@gmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "csilvers@live.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "wonderkid@att.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "jyoliver@mac.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "agolomsh@yahoo.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "draper@verizon.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "brainless@mac.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "valdez@icloud.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "hachi@me.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "henkp@gmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "draper@optonline.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "mbrown@att.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "gumpish@icloud.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "pontipak@optonline.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "janusfury@hotmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "tellis@live.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "amichalo@live.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "ovprit@hotmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "nighthawk@hotmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "dbanarse@hotmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "pmint@optonline.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "amichalo@optonline.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "scato@hotmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "scotfl@me.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "ilikered@gmail.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "nichoj@me.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "hstiles@icloud.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "willg@att.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "elflord@outlook.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "hakim@mac.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "ilikered@outlook.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "melnik@comcast.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "hmbrand@yahoo.ca", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "phish@optonline.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "dbrobins@mac.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "eurohack@outlook.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "msusa@att.net", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "sisyphus@mac.com", birthdate: new Date("1995-12-17T03:24:00") },
  { email: "purvis@sbcglobal.net", birthdate: new Date("1995-12-17T03:24:00") },
];

async function seedProfiles() {
  console.log("Seeding profiles...");

  return Promise.all(
    profiles.map(({ email, birthdate }) => {
      return prisma.profile.upsert({
        where: { email },
        update: {},
        create: {
          email,
          birthdate,
          workouts: {
            createMany: {
              data: [
                { name: "A", days: [Weekday.Monday, Weekday.Thursday], biSets: [] },
                { name: "B", days: [Weekday.Tuesday, Weekday.Friday], biSets: [] },
                { name: "C", days: [Weekday.Wednesday, Weekday.Saturday], biSets: [] },
              ],
            },
          },
        },
      });
    }),
  );
}

async function seed() {
  await seedExercises();
  await seedProfiles();
}

void seed();
