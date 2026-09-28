/**
 * Marathi & English Retrieval-Augmented Generation (RAG) Engine
 * Strictly retrieves and formats verified scheme information from local dataset.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SCHEMES_FILE = path.join(__dirname, 'data', 'schemes.json');

function getSchemes() {
  try {
    const raw = fs.readFileSync(SCHEMES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading schemes file:', err);
    return [];
  }
}

// Common generic stop words to exclude from score calculation
const STOP_WORDS = new Set([
  'योजना', 'स्कीम', 'काय', 'आहे', 'आहेत', 'होय', 'नाही', 'माहिती', 'पाहिजे', 'सांगा',
  'कशी', 'मिळेल', 'मिळते', 'करावा', 'कसा', 'असेल', 'सांगावा', 'माहितीसंच', 'बांधणे', 'फ्री',
  'अनुदान', 'पैसे', 'मदत', 'दरमहा', 'मिळणारे', 'सांगावी',
  'scheme', 'yojana', 'what', 'is', 'are', 'the', 'for', 'in', 'of', 'and', 'how', 'to', 'apply', 'get', 'aid', 'money'
]);

function tokenize(text) {
  if (!text) return [];
  const clean = text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'’\[\]]/g, ' ')
    .trim();

  return clean.split(/\s+/).filter((t) => t.length > 1);
}

const SYNONYMS = {
  'कागदपत्रे': ['कागदपत्र', 'कागदपत्रे', 'डॉक्युमेंट', 'documents', 'doc', 'कागद', 'पुरावा'],
  'पात्रता': ['पात्रता', 'अटी', 'शर्ती', 'eligibility', 'पात्र', 'नियम', 'वयोमर्यादा'],
  'लाभ': ['लाभ', 'फायदा', 'रक्कम', 'benefit', 'amount', 'हप्ता', 'पैसे'],
  'अर्ज': ['अर्ज', 'फॉर्म', 'प्रक्रिया', 'कसा करावा', 'online', 'apply', 'application', 'नोंदणी'],
  'महिला': ['महिला', 'स्त्री', 'बहीण', 'मुली', 'महिलांना', 'women', 'lady', 'ladies', 'female', 'लाडकी', 'माझी', 'अन्नपूर्णा', 'लेक', 'अस्मिता'],
  'शेतकरी': ['शेतकरी', 'शेती', 'बळीराजा', 'शेतकऱ्यांना', 'farmer', 'farmers', 'agriculture', 'नमो', 'विहीर', 'सिंचन', 'तुषार', 'ट्रॅक्टर', 'शेततळे', 'कापूस', 'कांदा', 'बांबू'],
  'शिक्षण': ['शिक्षण', 'शिष्यवृत्ती', 'स्कॉलरशिप', 'शाळा', 'कॉलेज', 'विद्यार्थी', 'education', 'scholarship', 'student', 'शाहू', 'पंजाबराव', 'फी', 'सारथी', 'बार्टी', 'स्वाधार', 'स्वयं'],
  'आरोग्य': ['आरोग्य', 'दवाखाना', 'उपचार', 'रुग्णालय', 'आजार', 'health', 'hospital', 'medical', 'ज्योतिराव', 'फुले', 'mjpjay', '५ लाख', 'आयुष्मान', 'विमा'],
  'घर': ['घरकुल', 'आवास', 'छत', 'housing', 'house', 'home', 'शबरी', 'रमाई', 'पंतप्रधान', 'मोदी', 'यशवंतराव'],
  'गॅस': ['गॅस', 'सिलिंडर', 'अन्नपूर्णा', 'उज्ज्वला', 'lpg', 'cylinder', 'gas'],
  'ज्येष्ठ': ['ज्येष्ठ', 'वृद्ध', 'पेंशन', 'निराधार', 'senior', 'pension', 'संजय', 'गांधी', 'वयश्री', 'तीर्थ', 'श्रावणबाळ'],
  'अपंग': ['अपंग', 'दिव्यांग', 'disabled', 'handicapped', 'udid'],
  'उद्योग': ['उद्योग', 'उद्योजक', 'व्यवसाय', 'कर्ज', 'लोन', 'सबसिडी', 'बँक', 'loan', 'business', 'mudra', 'cmegp', 'pmegp', 'vishwakarma', 'अण्णासाहेब', 'माविम'],
  'पेन्शन': ['पेन्शन', 'निवृत्तीवेतन', 'pension', 'श्रावणबाळ', 'अटल', 'मानधन', 'असंगठित', 'श्रम'],
  'सोलर': ['सोलर', 'रूफटॉप', 'solar', 'वीज', 'कुसुम', 'सौर', 'सूर्य', 'बिजली', 'electricity', 'महावितरण'],
  'कामगार': ['कामगार', 'मजूर', 'श्रम', 'labor', 'worker', 'construction', 'bocw', 'eshram', 'ई-श्रम'],
  'पशुधन': ['पशुधन', 'शेळी', 'पोल्ट्री', 'दुग्ध', 'दूध', 'मत्स्य', 'मासे', 'goat', 'poultry', 'dairy', 'fish', 'कुकुटपालन']
};

function calculateRelevanceScore(queryTokens, scheme) {
  let score = 0;
  // Filter out generic stop words for core topic matching
  const coreTokens = queryTokens.filter(t => !STOP_WORDS.has(t));

  if (coreTokens.length === 0) return 0;

  const searchableTextMr = [
    scheme.nameMr,
    scheme.objectiveMr,
    scheme.categoryMr,
    ...(scheme.beneficiariesMr || []),
    ...(scheme.eligibilityMr || [])
  ].join(' ').toLowerCase();

  const searchableTextEn = [
    scheme.nameEn,
    scheme.objectiveEn,
    scheme.categoryEn,
    ...(scheme.beneficiariesEn || []),
    ...(scheme.eligibilityEn || [])
  ].join(' ').toLowerCase();

  const combinedSearchText = searchableTextMr + ' ' + searchableTextEn;

  coreTokens.forEach((token) => {
    // Scheme name exact/partial match gets highest weight
    if (scheme.nameMr.toLowerCase().includes(token) || scheme.nameEn.toLowerCase().includes(token)) {
      score += 15;
    } else if (combinedSearchText.includes(token)) {
      score += 4;
    }

    // Synonym expansion match
    for (const [key, synonymList] of Object.entries(SYNONYMS)) {
      if (synonymList.includes(token)) {
        synonymList.forEach((syn) => {
          if (scheme.nameMr.toLowerCase().includes(syn) || scheme.nameEn.toLowerCase().includes(syn)) {
            score += 10;
          } else if (combinedSearchText.includes(syn)) {
            score += 3;
          }
        });
      }
    }
  });

  return score;
}

async function generateGeminiAnswer(userQuery, language, schemes) {
  const schemeContext = schemes.map((scheme, index) => {
    return `
SCHEME ${index + 1}

Name Marathi: ${scheme.nameMr}
Name English: ${scheme.nameEn}

Objective Marathi: ${scheme.objectiveMr}
Objective English: ${scheme.objectiveEn}

Benefit Marathi: ${scheme.benefitAmountMr}
Benefit English: ${scheme.benefitAmountEn}

Eligibility Marathi:
${(scheme.eligibilityMr || []).join('\n')}

Eligibility English:
${(scheme.eligibilityEn || []).join('\n')}

Documents Marathi:
${(scheme.documentsMr || []).join('\n')}

Documents English:
${(scheme.documentsEn || []).join('\n')}

Application Process Marathi:
${(scheme.applicationProcessMr || []).join('\n')}

Application Process English:
${(scheme.applicationProcessEn || []).join('\n')}

Official Link:
${scheme.officialLink || 'Not available'}
`;
  }).join('\n-------------------------\n');

  const languageInstruction =
    language === 'mr'
      ? 'Answer the user in natural, easy-to-understand Marathi.'
      : 'Answer the user in clear, natural English.';

  const prompt = `
You are a Government Schemes Assistant for Maharashtra.

${languageInstruction}

Understand the user's question and answer it using ONLY the verified
government scheme information provided below.

IMPORTANT:
- Do not invent schemes.
- Do not invent benefits.
- Do not invent eligibility.
- Do not invent documents.
- Do not invent application procedures.
- Do not invent links.
- Answer the user's actual question directly.
- Use simple language.
- If the information is not available, say so clearly.

USER QUESTION:
${userQuery}

VERIFIED SCHEME INFORMATION:
${schemeContext}

Now answer the user's question.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });

    return response.text;
  } catch (error) {
    console.error("Gemini generation error:", error);
    return null;
  }
}

export async function processQuery(userQuery, language = 'mr') {
  const schemes = getSchemes();
  const queryTokens = tokenize(userQuery);

  if (queryTokens.length === 0) {
    return {
      success: false,
      isMatched: false,
      answer: language === 'mr'
        ? "कृपया शासकीय योजनेविषयी प्रश्न किंवा योजनेचे नाव टाइप करा."
        : "Please type a question or scheme name to search.",
      sources: []
    };
  }

  // Score all schemes
  const scoredSchemes = schemes.map((scheme) => ({
    scheme,
    score: calculateRelevanceScore(queryTokens, scheme)
  }));

  // Require minimum score threshold of 10 to qualify as verified match
  const matched = scoredSchemes
    .filter((item) => item.score >= 4)
    .sort((a, b) => b.score - a.score);

  if (matched.length === 0) {
    return {
      success: true,
      isMatched: false,
      answer: language === 'mr'
        ? `माफ करा, "<b>${userQuery}</b>" या प्रश्नाशी संबंधित कोणतीही माहिती आमच्या सत्यापित माहितीसंचात (Verified Dataset) उपलब्ध नाही.<br/><br/>
💡 <b>टीप:</b> तुम्ही उपलब्ध 'योजना सूची' (Directory) मध्ये सर्व योजना पाहू शकता किंवा शेतकरी, महिला, विद्यार्थी इत्यादी प्रवर्गांनुसार शोधू शकता.`
        : `Sorry, no verified information was found matching "<b>${userQuery}</b>" in our database.<br/><br/>
💡 <b>Tip:</b> You can browse the Scheme Directory or filter by categories like Farmers, Women, Students, etc.`,
      sources: []
    };
  }

const topMatch = matched[0].scheme;
const secondaryMatches = matched.slice(1, 4).map(m => m.scheme);

const schemesForGemini = [
  topMatch,
  ...secondaryMatches
];

const geminiAnswer = await generateGeminiAnswer(
  userQuery,
  language,
  schemesForGemini
);

  const isDocQuery = queryTokens.some(t => SYNONYMS['कागदपत्रे'].includes(t));
  const isEligibleQuery = queryTokens.some(t => SYNONYMS['पात्रता'].includes(t));
  const isApplyQuery = queryTokens.some(t => SYNONYMS['अर्ज'].includes(t));

  let answerText = '';

  if (language === 'mr') {
    answerText += `### 📌 ${topMatch.nameMr} (${topMatch.categoryMr})\n\n`;
    answerText += `**योजनेचे उद्दिष्ट:** ${topMatch.objectiveMr}\n\n`;
    answerText += `💰 **मिळणारा लाभ:** ${topMatch.benefitAmountMr}\n\n`;

    if (isDocQuery) {
      answerText += `📄 **आवश्यक कागदपत्रे:**\n`;
      topMatch.documentsMr.forEach(doc => { answerText += `- ${doc}\n`; });
      answerText += `\n✅ **पात्रता:**\n`;
      topMatch.eligibilityMr.forEach(el => { answerText += `- ${el}\n`; });
    } else if (isEligibleQuery) {
      answerText += `✅ **पात्रता निकष:**\n`;
      topMatch.eligibilityMr.forEach(el => { answerText += `- ${el}\n`; });
      answerText += `\n📄 **आवश्यक कागदपत्रे:**\n`;
      topMatch.documentsMr.forEach(doc => { answerText += `- ${doc}\n`; });
    } else if (isApplyQuery) {
      answerText += `📝 **अर्ज कसा करावा (प्रक्रिया):**\n`;
      topMatch.applicationProcessMr.forEach(step => { answerText += `- ${step}\n`; });
      answerText += `\n📄 **आवश्यक कागदपत्रे:**\n`;
      topMatch.documentsMr.forEach(doc => { answerText += `- ${doc}\n`; });
    } else {
      answerText += `✅ **पात्रता निकष:**\n`;
      topMatch.eligibilityMr.slice(0, 3).forEach(el => { answerText += `- ${el}\n`; });
      answerText += `\n📄 **आवश्यक कागदपत्रे:**\n`;
      topMatch.documentsMr.slice(0, 4).forEach(doc => { answerText += `- ${doc}\n`; });
      answerText += `\n📝 **अर्ज कसा करावा:**\n`;
      topMatch.applicationProcessMr.slice(0, 3).forEach(step => { answerText += `- ${step}\n`; });
    }

    if (secondaryMatches.length > 0) {
      answerText += `\n---
🔍 **इतर संबंधित योजना:** ${secondaryMatches.map(m => m.nameMr).join(', ')}`;
    }
  } else {
    answerText += `### 📌 ${topMatch.nameEn} (${topMatch.categoryEn})\n\n`;
    answerText += `**Objective:** ${topMatch.objectiveEn}\n\n`;
    answerText += `💰 **Benefit Amount:** ${topMatch.benefitAmountEn}\n\n`;

    if (isDocQuery) {
      answerText += `📄 **Required Documents:**\n`;
      topMatch.documentsEn.forEach(doc => { answerText += `- ${doc}\n`; });
      answerText += `\n✅ **Eligibility:**\n`;
      topMatch.eligibilityEn.forEach(el => { answerText += `- ${el}\n`; });
    } else if (isEligibleQuery) {
      answerText += `✅ **Eligibility Criteria:**\n`;
      topMatch.eligibilityEn.forEach(el => { answerText += `- ${el}\n`; });
      answerText += `\n📄 **Required Documents:**\n`;
      topMatch.documentsEn.forEach(doc => { answerText += `- ${doc}\n`; });
    } else if (isApplyQuery) {
      answerText += `📝 **Application Process:**\n`;
      topMatch.applicationProcessEn.forEach(step => { answerText += `- ${step}\n`; });
      answerText += `\n📄 **Required Documents:**\n`;
      topMatch.documentsEn.forEach(doc => { answerText += `- ${doc}\n`; });
    } else {
      answerText += `✅ **Eligibility Criteria:**\n`;
      topMatch.eligibilityEn.slice(0, 3).forEach(el => { answerText += `- ${el}\n`; });
      answerText += `\n📄 **Required Documents:**\n`;
      topMatch.documentsEn.slice(0, 4).forEach(doc => { answerText += `- ${doc}\n`; });
      answerText += `\n📝 **Application Process:**\n`;
      topMatch.applicationProcessEn.slice(0, 3).forEach(step => { answerText += `- ${step}\n`; });
    }

    if (secondaryMatches.length > 0) {
      answerText += `\n---
🔍 **Other Related Schemes:** ${secondaryMatches.map(m => m.nameEn).join(', ')}`;
    }
  }

  const sources = [
    {
      id: topMatch.id,
      nameMr: topMatch.nameMr,
      nameEn: topMatch.nameEn,
      officialLink: topMatch.officialLink,
      lastVerified: topMatch.lastVerified
    },
    ...secondaryMatches.map(m => ({
      id: m.id,
      nameMr: m.nameMr,
      nameEn: m.nameEn,
      officialLink: m.officialLink,
      lastVerified: m.lastVerified
    }))
  ];

  return {
    success: true,
    isMatched: true,
    answer: geminiAnswer || answerText,
    sources
  };
}
