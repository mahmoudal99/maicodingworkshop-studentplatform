import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt =
  "Think Like a Programmer — an interactive spaceship-themed coding workshop for ages 12–17.";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

const STAR_POINTS = [
  { left: 82, top: 70, size: 6, opacity: 0.9 },
  { left: 140, top: 110, size: 3, opacity: 0.85 },
  { left: 214, top: 82, size: 4, opacity: 0.8 },
  { left: 306, top: 148, size: 5, opacity: 0.7 },
  { left: 404, top: 90, size: 4, opacity: 0.9 },
  { left: 512, top: 74, size: 3, opacity: 0.75 },
  { left: 598, top: 132, size: 5, opacity: 0.8 },
  { left: 694, top: 92, size: 4, opacity: 0.85 },
  { left: 790, top: 120, size: 3, opacity: 0.7 },
  { left: 892, top: 78, size: 5, opacity: 0.85 },
  { left: 998, top: 118, size: 4, opacity: 0.8 },
  { left: 1096, top: 92, size: 3, opacity: 0.72 },
  { left: 104, top: 508, size: 4, opacity: 0.75 },
  { left: 188, top: 560, size: 3, opacity: 0.82 },
  { left: 292, top: 492, size: 5, opacity: 0.8 },
  { left: 388, top: 560, size: 4, opacity: 0.88 },
  { left: 510, top: 530, size: 3, opacity: 0.7 },
  { left: 648, top: 552, size: 5, opacity: 0.8 },
  { left: 760, top: 510, size: 4, opacity: 0.76 },
  { left: 854, top: 560, size: 3, opacity: 0.82 },
  { left: 950, top: 514, size: 5, opacity: 0.9 },
  { left: 1088, top: 548, size: 4, opacity: 0.78 },
];

export async function createSocialImage() {
  const [boldPixels, heroPlanetFile, leftPlanetFile, midPlanetFile, panelFile] =
    await Promise.all([
      readFile(join(process.cwd(), "public", "BoldPixels.ttf")),
      readFile(join(process.cwd(), "public", "Planets", "p7.png")),
      readFile(join(process.cwd(), "public", "Planets", "p8.png")),
      readFile(join(process.cwd(), "public", "Planets", "p11.png")),
      readFile(
        join(process.cwd(), "public", "wenrexa-ui-kit-4", "PNG", "Panel02.png")
      ),
    ]);

  const heroPlanet = `data:image/png;base64,${heroPlanetFile.toString("base64")}`;
  const leftPlanet = `data:image/png;base64,${leftPlanetFile.toString("base64")}`;
  const midPlanet = `data:image/png;base64,${midPlanetFile.toString("base64")}`;
  const panel = `data:image/png;base64,${panelFile.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 18% 26%, rgba(51, 182, 255, 0.20), transparent 28%), radial-gradient(circle at 74% 32%, rgba(122, 83, 255, 0.22), transparent 30%), linear-gradient(180deg, #09111f 0%, #050914 100%)",
          color: "#F3F7FF",
        }}
      >
        <img
          src={leftPlanet}
          alt=""
          style={{
            position: "absolute",
            left: "-58px",
            bottom: "-72px",
            width: "280px",
            height: "280px",
            opacity: 0.82,
          }}
        />
        <img
          src={midPlanet}
          alt=""
          style={{
            position: "absolute",
            left: "84px",
            top: "92px",
            width: "142px",
            height: "142px",
            opacity: 0.84,
          }}
        />
        <img
          src={heroPlanet}
          alt=""
          style={{
            position: "absolute",
            right: "-72px",
            top: "28px",
            width: "340px",
            height: "340px",
            opacity: 0.88,
          }}
        />

        {STAR_POINTS.map((star) => (
          <div
            key={`${star.left}-${star.top}`}
            style={{
              position: "absolute",
              left: `${star.left}px`,
              top: `${star.top}px`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              borderRadius: "999px",
              background: "#F8FCFF",
              opacity: star.opacity,
            }}
          />
        ))}

        <div
          style={{
            position: "absolute",
            inset: "46px 56px 44px 56px",
            display: "flex",
            flexDirection: "column",
            border: "1px solid rgba(106, 154, 210, 0.34)",
            borderRadius: "36px",
            background: "rgba(7, 11, 20, 0.48)",
            boxShadow: "0 30px 80px rgba(0, 0, 0, 0.42)",
            padding: "42px 48px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "28px",
            }}
          >
            <div
              style={{
                display: "flex",
                fontFamily: "BoldPixels",
                fontSize: 28,
                letterSpacing: 1.2,
                color: "#74E589",
              }}
            >
              TLP_
            </div>
            <div
              style={{
                display: "flex",
                fontFamily: "BoldPixels",
                fontSize: 18,
                color: "#59D7FF",
                letterSpacing: 1,
              }}
            >
              6-WEEK CODING JOURNEY
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flex: 1,
              alignItems: "center",
              justifyContent: "space-between",
              gap: "34px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                maxWidth: "700px",
                gap: "18px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "BoldPixels",
                  fontSize: 24,
                  letterSpacing: 1,
                  color: "#74E589",
                }}
              >
                  SPACESHIP MISSIONS FOR AGES 12–17
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  fontFamily: "BoldPixels",
                  fontSize: 72,
                  lineHeight: 1.08,
                  letterSpacing: 1.4,
                }}
              >
                <span>Think Like a</span>
                <span style={{ color: "#74E589" }}>Programmer</span>
              </div>
              <div
                style={{
                  display: "flex",
                  maxWidth: "640px",
                  fontSize: 28,
                  lineHeight: 1.45,
                  color: "#C5D4EE",
                }}
              >
                Interactive coding games where students learn binary, sequencing, memory, and real code inside a living spaceship world.
              </div>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  marginTop: "12px",
                }}
              >
                {["BINARY", "REAL CODE", "SPACESHIP MISSIONS"].map((label) => (
                  <div
                    key={label}
                    style={{
                      display: "flex",
                      padding: "12px 18px",
                      borderRadius: "999px",
                      border: "1px solid rgba(84, 132, 212, 0.34)",
                      background: "rgba(17, 26, 46, 0.86)",
                      fontFamily: "BoldPixels",
                      fontSize: 18,
                      color: "#DCE7FF",
                      letterSpacing: 0.9,
                    }}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                position: "relative",
                width: "288px",
                height: "352px",
                alignItems: "stretch",
              }}
            >
              <img
                src={panel}
                alt=""
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: 0.98,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: "28px 24px 26px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  padding: "22px 20px",
                  borderRadius: "24px",
                  background:
                    "linear-gradient(180deg, rgba(9, 16, 31, 0.95), rgba(7, 11, 20, 0.86))",
                  boxShadow: "inset 0 0 0 1px rgba(88, 141, 217, 0.24)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    fontFamily: "BoldPixels",
                    fontSize: 18,
                    color: "#59D7FF",
                    letterSpacing: 1,
                  }}
                >
                  LIVE COURSE MAP
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  {[
                    { label: "Week 1", fill: "#59D7FF" },
                    { label: "Week 2", fill: "#74E589" },
                    { label: "Week 3", fill: "#FFD56A" },
                  ].map((item, index) => (
                    <div
                      key={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          width: "20px",
                          height: "20px",
                          borderRadius: "999px",
                          background: item.fill,
                          boxShadow: `0 0 20px ${item.fill}88`,
                        }}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            fontFamily: "BoldPixels",
                            fontSize: 16,
                            color: "#F3F7FF",
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            height: "8px",
                            borderRadius: "999px",
                            background: "rgba(37, 55, 90, 0.8)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              width: `${70 - index * 16}%`,
                              background: item.fill,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontFamily: "BoldPixels",
                    fontSize: 16,
                    color: "#C5D4EE",
                  }}
                >
                  <span>BUILD • PLAY • LEARN</span>
                  <span style={{ color: "#74E589" }}>LIVE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "BoldPixels",
          data: boldPixels,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}
