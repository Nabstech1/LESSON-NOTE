// Sample config for all provided sets
const questionnaire = [
  { topic: "Mohtamim Tajneed", questions: [
    { label: "Tajneed", subfields: ["Khuddam", "Atfal", "Total"] },
    { label: "No. of Regions & Majalis", subfields: ["Region", "Majalis"] }
  ]},
  { topic: "Motamad", questions: [
    { label: "No. of National Amila Meetings held this month" },
    { label: "Attendance" },
    { label: "No. of Monthly Reports submitted by", subfields: ["Mohtamims", "Regions", "Majalis"] },
    { label: "No. of Majalis held General Meeting" },
    { label: "Attendance (General Meeting)" },
    { label: "No. of Majalis held Amila meetings" }
  ]},
  { topic: "Mohtamim Tarbiyyat", questions: [
    { label: "No. of National Aamila Members" },
    { label: "Offer Jumma Prayer" },
    { label: "Are Musi" },
    { label: "Five daily Prayers" },
    { label: "No. of Khuddam offer 5 daily prayers" },
    { label: "No. of Khuddam who offer prayers in congregation" },
    { label: "No. of Khuddam who recite Holy Quran" },
    { label: "No. of Khuddam who listen to Huzur's Friday Sermons" }
  ]},
  { topic: "Mohtamim Nau Mobaeeen", questions: [
    { label: "No. of Nau Mobaeen" },
    { label: "No. of active Nau Mobaeen" },
    { label: "Programmes organised & Muakhat (brotherhood) established for them" }
  ]},
  { topic: "Additional Mohtamim Tarbiyyat Rishta Nata", questions: [
    { label: "No. of Khuddam of marriage age" },
    { label: "No. of Khuddam Registered in Rishta Nata" },
    { label: "No. of Programmes organised to inculcate the sanctity of marriage" }
  ]},
  { topic: "Mohtamim Tabligh", questions: [
    { label: "No. of Daeen e ElAllah" },
    { label: "No. Persons under Tabligh" },
    { label: "No. of Tabligh stalls" },
    { label: "No. of literature distributed" },
    { label: "No. of Baits this year" },
    { label: "No. of Baits of this month" }
  ]},
  { topic: "Mohtamim Taalim", questions: [
    { label: "No. of Khuddam in Colleges" },
    { label: "No. of Khuddam in Universities" },
    { label: "No. of Taalim Seminars" },
    { label: "No. of illiterate educated" },
    { label: "No. of Khuddam read Jamaat Books" },
    { label: "No. of Taalim Classes" }
  ]},
  { topic: "Mohtamim Waqar e Amal", questions: [
    { label: "No. of Majalis organised Waqar e Amal" },
    { label: "Total Attendance" },
    { label: "Total Number of hours of Waqar e Amal" }
  ]},
  { topic: "Mohtamim Maal", questions: [
    { label: "No. of Khuddam included in Budget" },
    { label: "No. of non Payers" },
    { label: "Collection", subfields: [
      { label: "This month", subfields: ["Currency", "Majlis", "Ijtema", "Total"] },
      { label: "Up to last month", subfields: ["Currency", "Majlis", "Ijtema", "Total"] },
      { label: "Remaining amount" }
    ]}
  ]},
  { topic: "Mohtamim Tehrik e Jadid", questions: [
    { label: "How many Khuddam took part in and contributed" },
    { label: "New Contributors" }
  ]},
  { topic: "Mohtamim Sanat o Tijarat", questions: [
    { label: "Khuddam given help with business/employment" }
  ]},
  { topic: "Mohtamim Amoor e Talaba", questions: [
    { label: "Are students details kept updated" },
    { label: "Are all affairs of the Khuddam students properly supervised" },
    { label: "AMSA Registered" }
  ]},
  { topic: "Mohtamim Khidmat e Khalq", questions: [
    { label: "How many Khuddam visited sick or elderly?", subfields: ["Sick", "Elderly"] },
    { label: "How many Majalis arranged 'Feed the hungry Programme'", subfields: ["No. of participants"] }
  ]},
  { topic: "Mohtamim Sehat e Jismani", questions: [
    { label: "No. of Khuddam regular in exercise" },
    { label: "No. of Khuddam who have bicycles" }
  ]},
  { topic: "Mohtamim Isha'at", questions: [
    { label: "Any publication" }
  ]},
  { topic: "Mohtamim Atfal", questions: [
    { label: "No. of Regions & Majalis", subfields: ["Region", "Majalis"] },
    { label: "No. of Monthly Reports submitted by", subfields: ["Mohtamim", "Regions", "Majalis"] },
    { label: "Date" }
  ]}
];

function createInput(name, label, type = "text") {
  const wrapper = document.createElement("div");
  wrapper.className = "subfields-row";
  const lbl = document.createElement("label");
  lbl.textContent = label;
  lbl.setAttribute("for", name);
  wrapper.appendChild(lbl);
  const input = document.createElement("input");
  input.type = type;
  input.id = name;
  input.name = name;
  wrapper.appendChild(input);
  return wrapper;
}

function createTextarea(name, label) {
  const wrapper = document.createElement("div");
  wrapper.className = "subfields-row";
  const lbl = document.createElement("label");
  lbl.textContent = label;
  lbl.setAttribute("for", name);
  wrapper.appendChild(lbl);
  const textarea = document.createElement("textarea");
  textarea.id = name;
  textarea.name = name;
  wrapper.appendChild(textarea);
  return wrapper;
}

function renderQuestionGroup(topicIdx, qIdx, question) {
  const group = document.createElement("div");
  group.className = "question-group";
  const label = document.createElement("div");
  label.className = "question-label";
  label.textContent = question.label;
  group.appendChild(label);

  // Handle subfields (array or nested)
  if (Array.isArray(question.subfields)) {
    if (typeof question.subfields[0] === "string") {
      // Simple subfields (e.g., Khuddam, Atfal, Total)
      const row = document.createElement("div");
      row.className = "subfields-row";
      question.subfields.forEach((sub, subIdx) => {
        row.appendChild(createInput(`q_${topicIdx}_${qIdx}_${subIdx}`, sub));
      });
      group.appendChild(row);
    } else {
      // Nested subfields (e.g., Collection)
      question.subfields.forEach((sub, subIdx) => {
        const subLabel = document.createElement("div");
        subLabel.className = "question-label";
        subLabel.style.fontWeight = "400";
        subLabel.style.marginLeft = "12px";
        subLabel.textContent = sub.label;
        group.appendChild(subLabel);
        const row = document.createElement("div");
        row.className = "subfields-row";
        (sub.subfields || []).forEach((subsub, subsubIdx) => {
          row.appendChild(createInput(`q_${topicIdx}_${qIdx}_${subIdx}_${subsubIdx}`, subsub));
        });
        group.appendChild(row);
      });
    }
  } else if (question.label.toLowerCase().includes("programme") || question.label.toLowerCase().includes("publication") || question.label.toLowerCase().includes("established")) {
    // Use textarea for descriptive answers
    group.appendChild(createTextarea(`q_${topicIdx}_${qIdx}`, "Answer"));
  } else if (question.label.toLowerCase().includes("date")) {
    group.appendChild(createInput(`q_${topicIdx}_${qIdx}`, "Date", "date"));
  } else {
    group.appendChild(createInput(`q_${topicIdx}_${qIdx}`, "Answer"));
  }
  return group;
}

function renderQuestionnaire() {
  const container = document.getElementById("questionnaire-sections");
  questionnaire.forEach((topic, topicIdx) => {
    const acc = document.createElement("div");
    acc.className = "accordion";
    const header = document.createElement("div");
    header.className = "accordion-header";
    header.textContent = topic.topic;
    const arrow = document.createElement("span");
    arrow.textContent = "▼";
    header.appendChild(arrow);
    acc.appendChild(header);
    const content = document.createElement("div");
    content.className = "accordion-content";
    topic.questions.forEach((q, qIdx) => {
      content.appendChild(renderQuestionGroup(topicIdx, qIdx, q));
    });
    acc.appendChild(content);
    header.onclick = () => {
      acc.classList.toggle("open");
      arrow.textContent = acc.classList.contains("open") ? "▲" : "▼";
    };
    if (topicIdx === 0) acc.classList.add("open");
    container.appendChild(acc);
  });
}

function collectAnswers() {
  const answers = {};
  questionnaire.forEach((topic, topicIdx) => {
    answers[topic.topic] = {};
    topic.questions.forEach((q, qIdx) => {
      if (Array.isArray(q.subfields)) {
        if (typeof q.subfields[0] === "string") {
          // Simple subfields
          answers[topic.topic][q.label] = {};
          q.subfields.forEach((sub, subIdx) => {
            const val = document.getElementById(`q_${topicIdx}_${qIdx}_${subIdx}`).value;
            answers[topic.topic][q.label][sub] = val;
          });
        } else {
          // Nested subfields
          answers[topic.topic][q.label] = {};
          q.subfields.forEach((sub, subIdx) => {
            answers[topic.topic][q.label][sub.label] = {};
            (sub.subfields || []).forEach((subsub, subsubIdx) => {
              const val = document.getElementById(`q_${topicIdx}_${qIdx}_${subIdx}_${subsubIdx}`).value;
              answers[topic.topic][q.label][sub.label][subsub] = val;
            });
          });
        }
      } else {
        // Single input/textarea
        const el = document.getElementById(`q_${topicIdx}_${qIdx}`);
        answers[topic.topic][q.label] = el ? el.value : "";
      }
    });
  });
  return answers;
}

document.addEventListener("DOMContentLoaded", () => {
  renderQuestionnaire();
  document.getElementById("questionnaire-form").onsubmit = function(e) {
    e.preventDefault();
    const answers = collectAnswers();
    const output = document.getElementById("json-output");
    output.textContent = JSON.stringify(answers, null, 2);
    output.style.display = "block";
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  };
}); 