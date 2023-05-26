/* eslint-disable jsx-a11y/alt-text */

import type { Exercise, ExerciseInWorkout, Profile, User, Workout } from "@prisma/client";
import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import dynamic from "next/dynamic";
import FullPage from "../components/FullPage";
import { dataSheetTranslation, datasheetLayout, weekdaysTranslation } from "../utils/consts";
import type { ParseJsonValues } from "../utils/types";

const PDFViewerWithNoSSR = dynamic(async () => (await import("@react-pdf/renderer")).PDFViewer, {
  ssr: false,
});

Font.register({
  family: "Inter",
  fonts: [
    {
      fontWeight: 100,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyeMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 200,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyfMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 300,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuOKfMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 400,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 500,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 600,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuGKYMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 700,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 800,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuDyYMZhrib2Bg-4.ttf",
    },
    {
      fontWeight: 900,
      src: "http://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuBWYMZhrib2Bg-4.ttf",
    },
  ],
});

const styles = StyleSheet.create({
  viewer: {
    width: "100%",
    height: "100%",
  },
  page: {
    fontFamily: "Inter",
    backgroundColor: "#ffffff",
    color: "#000000",
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
  },
  logo: {
    width: 100,
  },
  logoContainer: {
    padding: 32,
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
  },
  blueText: {
    color: "#2563eb",
  },
});

const MeasurementCard = ({ title }: { title: string }) => (
  <View
    style={{
      width: "100%",
      borderWidth: 1,
      padding: 8,
    }}
  >
    <View style={{ fontSize: 14 }}>
      <Text>{title}</Text>
    </View>
    <View
      style={{
        fontSize: 14,
        color: "#111827",
        height: "100%",
        width: "100%",
      }}
    ></View>
  </View>
);

type Props = {
  profile: Profile & { user: User };
  workouts: Workout[];
};

// Create Document Component
function BasicDocument(props: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.logoContainer}>
          <Image src="/logo1.png" style={styles.logo} />
          <Image src="/logo2.png" style={styles.logo} />
        </View>
        <View style={styles.title}>
          <Text style={styles.blueText}>FICHA DE TREINO</Text>
          <Text style={{ fontSize: 20, fontWeight: 500 }}>|</Text>
          <Text>IDMFit</Text>
        </View>
        <View style={{ padding: 32 }}>
          <Text style={{ textAlign: "center" }}>{props.profile.user.name}</Text>
          <View
            style={{
              padding: 16,
              height: "70%",
              width: "100%",
              gap: 8,
            }}
          >
            <Text style={{ padding: "0 0 32 0", color: "#2563eb" }}>Medidas:</Text>
            {datasheetLayout.map(([left, right], i) => (
              <View
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <MeasurementCard title={dataSheetTranslation[left]} />
                <MeasurementCard title={dataSheetTranslation[right]} />
              </View>
            ))}
          </View>
        </View>
      </Page>
      <Page size="A4" style={styles.page}>
        <View style={{ padding: 32 }}>
          <Text style={{ textAlign: "center" }}>Treinos:</Text>
          <View
            style={{
              padding: 16,
              height: "70%",
              width: "100%",
              gap: 8,
            }}
          >
            {props.workouts.map((workout, i) => (
              <View
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 8,
                }}
              >
                <View
                  style={{
                    width: "100%",
                    borderWidth: 1,
                    padding: 8,
                  }}
                >
                  <View style={{ fontSize: 14 }}>
                    <Text>{workout.name}</Text>

                    <Text>{workout.days.map(w => weekdaysTranslation[w]).join(", ")}</Text>
                  </View>
                  <View
                    style={{
                      fontSize: 14,
                      color: "#111827",
                      height: "100%",
                      width: "100%",
                    }}
                  ></View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </Page>
    </Document>
  );
}

const profile: Profile & { user: User } = {
  id: "1",
  email: "johndoe@gmail.com",
  user: {
    id: "1",
    name: "John Doe",
    email: "johndoe@gmail.com",
    emailVerified: null,
    image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/9/90/Petersen_graph_3-coloring.svg/1200px-Petersen_graph_3-coloring.svg.png",
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  userId: "1",
};

const workouts: ParseJsonValues<
  Workout & { exercises: (ExerciseInWorkout & { exercise: Exercise })[] }
>[] = [
  {
    id: "1",
    profileId: "1",
    name: "A",

    days: ["Monday", "Wednesday", "Friday"],
    exercises: [
      {
        id: "1",
        workoutId: "1",
        createdAt: new Date(),
        updatedAt: new Date(),
        description: "",
        exercise: {
          id: "1",
          name: "Supino Reto",
          category: "Peitoral",
          createdAt: new Date(),
          updatedAt: new Date(),
          image: null,
        },
        exerciseId: "1",
        index: 0,
        method: "Standard",
        sets: [
          {
            reps: 10,
            weight: 0,
          },
          {
            reps: 10,
            weight: 0,
          },
          {
            reps: 10,
            weight: 0,
          },
          {
            reps: 10,
            weight: 0,
          },
        ],
      },
    ],
    biSets: [["0", "1"]],

    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const Test = () => {
  return (
    <FullPage>
      <PDFViewerWithNoSSR style={styles.viewer}>
        <BasicDocument profile={profile} workouts={workouts} />
      </PDFViewerWithNoSSR>
    </FullPage>
  );
};

export default Test;
