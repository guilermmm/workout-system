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
  { email: "jartur.dev@gmail.com" },
  { email: "joao.moura59346@gmail.com" },
  { email: "guilherme.melo36451@alunos.ufersa.edu.br" },
  { email: "ournews@verizon.net" },
  { email: "simone@yahoo.com" },
  { email: "giafly@msn.com" },
  { email: "syncnine@comcast.net" },
  { email: "munjal@gmail.com" },
  { email: "goldberg@outlook.com" },
  { email: "alias@live.com" },
  { email: "hachi@gmail.com" },
  { email: "cremonini@icloud.com" },
  { email: "hutton@optonline.net" },
  { email: "scottlee@optonline.net" },
  { email: "moxfulder@gmail.com" },
  { email: "csilvers@live.com" },
  { email: "wonderkid@att.net" },
  { email: "jyoliver@mac.com" },
  { email: "agolomsh@yahoo.com" },
  { email: "draper@verizon.net" },
  { email: "brainless@mac.com" },
  { email: "valdez@icloud.com" },
  { email: "hachi@me.com" },
  { email: "henkp@gmail.com" },
  { email: "draper@optonline.net" },
  { email: "mbrown@att.net" },
  { email: "gumpish@icloud.com" },
  { email: "pontipak@optonline.net" },
  { email: "janusfury@hotmail.com" },
  { email: "tellis@live.com" },
  { email: "amichalo@live.com" },
  { email: "ovprit@hotmail.com" },
  { email: "nighthawk@hotmail.com" },
  { email: "dbanarse@hotmail.com" },
  { email: "pmint@optonline.net" },
  { email: "amichalo@optonline.net" },
  { email: "scato@hotmail.com" },
  { email: "scotfl@me.com" },
  { email: "ilikered@gmail.com" },
  { email: "nichoj@me.com" },
  { email: "hstiles@icloud.com" },
  { email: "willg@att.net" },
  { email: "elflord@outlook.com" },
  { email: "hakim@mac.com" },
  { email: "ilikered@outlook.com" },
  { email: "melnik@comcast.net" },
  { email: "hmbrand@yahoo.ca" },
  { email: "phish@optonline.net" },
  { email: "dbrobins@mac.com" },
  { email: "eurohack@outlook.com" },
  { email: "msusa@att.net" },
  { email: "sisyphus@mac.com" },
  { email: "purvis@sbcglobal.net" },
];

async function seedProfiles() {
  console.log("Seeding profiles...");

  return Promise.all(
    profiles.map(({ email }) => {
      return prisma.profile.upsert({
        where: { email },
        update: {},
        create: {
          email,
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
