export interface ModerationResult {
  isValid: boolean;
  category?: 'JUDOL' | 'PORNO' | 'SARA' | 'SCAM' | 'MALWARE';
  categoryLabel?: string;
  errorMessage?: string;
  detectedWord?: string;
}

// Prohibited term dictionaries
const FORBIDDEN_RULES: Array<{
  category: 'JUDOL' | 'PORNO' | 'SARA' | 'SCAM' | 'MALWARE';
  label: string;
  keywords: string[];
}> = [
  {
    category: 'JUDOL',
    label: 'Judi Online / Slot / Taruhan',
    keywords: [
      'slot',
      'judol',
      'judi',
      'zeus',
      'gacor',
      'maxwin',
      'sbobet',
      'togel',
      'poker',
      'bet88',
      'betting',
      'casino',
      'kasino',
      'roulette',
      'pragmatic',
      'scatter',
      'bandar judi',
      'taruhan bola',
      'agen judi',
      'domino qiu',
      'slot777',
      'slot88',
      'depo pulsa',
      'link gacor',
      'rtp live',
      'poker online',
      'baccarat',
      'live casino',
      'judi slot',
      'toto macau',
      'singapore pools',
      'hongkong pools',
      'dadu online',
    ],
  },
  {
    category: 'PORNO',
    label: 'Pornografi & Konten Dewasa',
    keywords: [
      'porn',
      'bokep',
      'sex',
      'xxx',
      'adult',
      'hentai',
      'onlyfans',
      'nsfw',
      'lendir',
      'colmek',
      'vcs',
      'porno',
      'jav',
      'ngentot',
      'telanjang',
      'open bo',
      'bokepindo',
      'video viral bokep',
      'sex tape',
      'esek esek',
      'prostitusi',
    ],
  },
  {
    category: 'SARA',
    label: 'Ujaran Kebencian, SARA & Ekstremisme',
    keywords: [
      'rasis',
      'sara',
      'teroris',
      'isis',
      'pki',
      'kebencian',
      'hate speech',
      'nazi',
      'kafir jahanam',
      'radikalisme',
      'pembantaian',
      'genosida',
      'anti islam',
      'anti kristen',
      'anti cina',
      'anti pribumi',
      'intoleransi',
    ],
  },
  {
    category: 'SCAM',
    label: 'Penipuan, Phishing & Skema Ponzi',
    keywords: [
      'phishing',
      'scam',
      'money game',
      'ponzi',
      'arisan bodong',
      'crypto scam',
      'hack akun',
      'cheat generator',
      'bobol saldo',
      'ganda uang',
      'pinjol ilegal',
      'investasi bodong',
      'giveaway palsu',
      'klaim hadiah palsu',
      'saldo gratis tanpa modal',
    ],
  },
  {
    category: 'MALWARE',
    label: 'Malware, Virus & Pembajakan Ilegal',
    keywords: [
      'malware',
      'keylogger',
      'ransomware',
      'spyware',
      'trojan',
      'cracked software',
      'nulled script',
      'ddos tool',
      'botnet',
      'exploit kit',
    ],
  },
];

/**
 * Validates project submission fields against prohibited content categories.
 */
export function validateProjectSubmission(data: {
  name: string;
  url: string;
  handle: string;
  tagline: string;
}): ModerationResult {
  const combinedText = `
    ${data.name.toLowerCase()} 
    ${data.url.toLowerCase()} 
    ${data.handle.toLowerCase()} 
    ${data.tagline.toLowerCase()}
  `.replace(/[^a-z0-9\s.-]/g, ' ');

  for (const group of FORBIDDEN_RULES) {
    for (const kw of group.keywords) {
      // Check if keyword is present as a standalone word or enclosed phrase
      const escaped = kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(^|\\b|\\s|_|-)${escaped}(\\b|\\s|_|-|$)`, 'i');

      // Also check simple substring if keyword length >= 4
      const isSubMatch = kw.length >= 4 && combinedText.includes(kw.toLowerCase());

      if (regex.test(combinedText) || isSubMatch) {
        return {
          isValid: false,
          category: group.category,
          categoryLabel: group.label,
          detectedWord: kw,
          errorMessage: `Proyek ditolak: Terdeteksi kata/konten terkait "${group.label}" (kata: "${kw}"). OmprengBid melarang keras proyek judi online, pornografi, SARA, penipuan, atau malware.`,
        };
      }
    }
  }

  return { isValid: true };
}
