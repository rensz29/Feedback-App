// All questions for the Zy WhatsApp Beta Test feedback form.
//
// The form page, the validation, the results page and the CSV export are all
// generated from this one list, so to change a question you only edit it here.
//
// Question types:
//   single  - pick one (radio buttons)
//   multi   - pick one or more (checkboxes)
//   scale   - 1 to 5, optionally with a "not tried yet" choice
//   text    - free text

export const NOT_TRIED = "Hindi ko pa nasubukan";
export const OTHER = "Iba pa";
export const NO_PROBLEM = "Wala akong naranasang problema";

export const TITLE = "Feedback Form: Zy WhatsApp Beta Test";

export const INTRO =
  "Salamat sa pagsali sa beta test ni Zy, ang WhatsApp bot ng Work Order App! " +
  "Gusto naming malaman kung ano ang gumagana at ano pa ang dapat ayusin. " +
  "Mga 5 minuto lang ito, at walang tama o maling sagot.";

export const REQUIRED_NOTE = "Lahat ng tanong ay required maliban sa may nakasulat na (optional).";

export const SECTIONS = [
  {
    title: "Seksyon 1: Tungkol sa iyo",
    questions: [
      {
        id: "q1_plant",
        num: 1,
        label: "Saang planta ka nagtatrabaho?",
        type: "single",
        options: ["Dressings", "Savoury"],
      },
      {
        id: "q2_position",
        num: 2,
        label: "Ano ang posisyon mo?",
        type: "single",
        options: ["Technician", "Supervisor o Engineer", "Administrator", OTHER],
        otherText: true,
      },
      {
        id: "q3_wo_count",
        num: 3,
        label: "Ilang work order na ang na-accept o na-close mo gamit si Zy?",
        type: "single",
        options: ["Wala pa", "1–3", "4–10", "Higit sa 10"],
      },
    ],
  },
  {
    title: "Seksyon 2: Pag-accept ng work order",
    questions: [
      {
        id: "q4_accept_ease",
        num: 4,
        label: "Gaano kadaling mag-accept ng work order sa pag-reply ng 👍 sa post ni Zy?",
        type: "scale",
        low: "Napakahirap",
        high: "Napakadali",
        notTried: true,
      },
      {
        id: "q5_reply_understood",
        num: 5,
        label:
          "Naintindihan mo ba agad na kailangang i-reply ang 👍, at hindi gagana " +
          "kung i-react o i-like lang ang post?",
        type: "single",
        options: [
          "Oo, naintindihan ko agad",
          "Naintindihan ko lang matapos magkamali o masabihan",
          "Hindi pa rin malinaw sa akin",
        ],
      },
    ],
  },
  {
    title: "Seksyon 3: Pag-close ng work order",
    questions: [
      {
        id: "q6_close_ease",
        num: 6,
        label:
          "Gaano kadaling mag-close ng work order sa pag-reply ng photo at ilang " +
          "salita tungkol sa repair?",
        type: "scale",
        low: "Napakahirap",
        high: "Napakadali",
        notTried: true,
      },
      {
        id: "q7_review_clarity",
        num: 7,
        label:
          "Malinaw ba sa iyo ang closure review ni Zy at ang mga pagpipilian " +
          "(1 = close, permanent fix · 2 = temporary fix · 3 = cancel)?",
        type: "scale",
        low: "Hindi malinaw",
        high: "Napakalinaw",
        notTried: true,
      },
      {
        id: "q8_fix_type",
        num: 8,
        label:
          "Alam mo ba kung kailan dapat piliin ang 1 (permanent fix) at kailan " +
          "ang 2 (temporary fix)?",
        type: "single",
        options: ["Oo, alam ko", "Minsan nalilito ako", "Hindi ko alam"],
      },
      {
        id: "q9_multi_photo",
        num: 9,
        label:
          "Kapag sabay-sabay kang nagpadala ng maraming photo, tama ba ang naging " +
          "sagot ni Zy (isang review lang para sa lahat ng photo)?",
        type: "single",
        options: ["Oo, tama", "Hindi, may naging problema", NOT_TRIED],
      },
    ],
  },
  {
    title: "Seksyon 4: Si Zy sa group",
    questions: [
      {
        id: "q10_speed",
        num: 10,
        label: "Gaano kabilis sumagot si Zy kapag nag-reply ka?",
        type: "single",
        options: [
          "Ilang segundo lang",
          "Mga 1 minuto",
          "Ilang minuto",
          "Minsan hindi sumasagot",
        ],
      },
      {
        id: "q11_problems",
        num: 11,
        label: "Alin sa mga ito ang naranasan mo na?",
        hint: "Puwedeng pumili ng marami.",
        type: "multi",
        options: [
          "Walang sagot si Zy",
          "Dalawang beses lumabas ang post o sagot",
          "Hindi naintindihan ni Zy ang mensahe ko",
          "Offline si Zy noong kailangan ko",
          "Maling work order ang na-accept o na-close",
          "Hindi pumasok ang photo",
          NO_PROBLEM,
          OTHER,
        ],
        exclusive: NO_PROBLEM,
        otherText: true,
      },
      {
        id: "q12_picture_guide",
        num: 12,
        label: 'Nakatulong ba ang picture guide (kapag nag-send ng "@Zy how to use")?',
        type: "single",
        options: ["Oo, malaking tulong", "Kaunti lang", "Hindi nakatulong", NOT_TRIED],
      },
      {
        id: "q13_language",
        num: 13,
        label: "English ang mga sagot ni Zy. Ano ang mas gusto mo?",
        type: "single",
        options: ["Okay na ang English", "Mas gusto ko ang Tagalog o Taglish", "Kahit alin"],
      },
    ],
  },
  {
    title: "Seksyon 5: WhatsApp kumpara sa app",
    questions: [
      {
        id: "q14_vs_app_speed",
        num: 14,
        label:
          "Kung ikukumpara sa app, gaano kabilis ang pag-accept at pag-close " +
          "sa WhatsApp?",
        type: "single",
        options: [
          "Mas mabilis sa WhatsApp",
          "Pareho lang",
          "Mas mabilis sa app",
          "Hindi ako gumagamit ng app",
        ],
      },
      {
        id: "q15_daily_pref",
        num: 15,
        label: "Alin ang mas gusto mong gamitin araw-araw?",
        type: "single",
        options: ["WhatsApp", "App", "Depende sa sitwasyon"],
      },
      {
        id: "q16_overall",
        num: 16,
        label: "Sa kabuuan, ano ang rating mo kay Zy?",
        type: "scale",
        low: "Hindi maganda",
        high: "Napakaganda",
        notTried: false,
      },
      {
        id: "q17_team_ready",
        num: 17,
        label: "Dapat na bang gamitin si Zy ng buong team?",
        type: "single",
        options: [
          "Oo, handa na",
          "Oo, pero ayusin muna ang mga problema",
          "Hindi pa",
        ],
      },
    ],
  },
  {
    title: "Seksyon 6: Mga suhestiyon mo",
    questions: [
      {
        id: "q18_liked",
        num: 18,
        label: "Ano ang pinakanagustuhan mo kay Zy?",
        type: "text",
        optional: true,
      },
      {
        id: "q19_confusing",
        num: 19,
        label: "Ano ang pinakanakakalito o pinakamahirap gawin?",
        type: "text",
        optional: true,
      },
      {
        id: "q20_change",
        num: 20,
        label: "Ano ang gusto mong idagdag o baguhin?",
        type: "text",
        optional: true,
      },
      {
        id: "q21_name",
        num: 21,
        label:
          "Kung okay lang na kausapin ka namin tungkol sa mga sagot mo, ilagay ang " +
          "pangalan mo. Huwag ilagay ang phone number.",
        type: "text",
        optional: true,
        short: true,
        noPhone: true,
      },
      {
        id: "q22_comments",
        num: 22,
        label: "May iba ka pang komento o rekomendasyon?",
        hint: "Halimbawa: mga gusto mong ipa-add o ipaayos kay Zy.",
        type: "text",
        optional: true,
      },
    ],
  },
];

export const QUESTIONS = SECTIONS.flatMap((section) => section.questions);
