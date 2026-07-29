import type { WordPack } from '../types'

// Données d'exemple — à remplacer/compléter avec tes propres listes.
// Chaque paire est [mot civil, mot undercover] : deux mots proches
// mais suffisamment différents pour créer le doute.
export const wordPacks: WordPack[] = [
  {
    id: 'classique',
    label: 'Classique',
    emoji: '🎭',
    pairs: [
      ['Plage', 'Piscine'],
      ['Chat', 'Tigre'],
      ['Café', 'Thé'],
      ['Pizza', 'Quiche'],
      ['Vélo', 'Moto'],
      ['Hôpital', 'Clinique'],
      ['Guitare', 'Violon'],
      ['Hiver', 'Automne'],
      ['Facebook', 'Instagram'],
      ['Pilote', 'Steward'],
    ],
  },
  {
    id: 'anime',
    label: 'Perso d’animé',
    emoji: '🍥',
    pairs: [
      ['Naruto', 'Sasuke'],
      ['Goku', 'Vegeta'],
      ['Luffy', 'Zoro'],
      ['Eren Yeager', 'Levi Ackerman'],
      ['Light Yagami', 'L'],
      ['Tanjiro', 'Zenitsu'],
      ['Deku', 'Bakugo'],
      ['Edward Elric', 'Alphonse Elric'],
      ['Saitama', 'Genos'],
      ['Sailor Moon', 'Sailor Mars'],
    ],
  },
  {
    id: 'films-series',
    label: 'Films & Séries',
    emoji: '🎬',
    pairs: [
      ['Harry Potter', 'Ron Weasley'],
      ['Iron Man', 'Captain America'],
      ['Dark', 'Stranger Things'],
      ['Batman', 'Joker'],
      ['Jon Snow', 'Daenerys Targaryen'],
      ['Yoda', 'Dark Vador'],
      ['Walter White', 'Jesse Pinkman'],
      ['Sherlock Holmes', 'Docteur Watson'],
      ['Woody', 'Buzz l’Éclair'],
      ['Shrek', 'L’âne'],
    ],
  },
  {
    id: 'chanteurs',
    label: 'Chanteurs / Chanteuses',
    emoji: '🎤',
    pairs: [
      ['Beyoncé', 'Rihanna'],
      ['Drake', 'The Weeknd'],
      ['Stromae', 'Angèle'],
      ['Taylor Swift', 'Ariana Grande'],
      ['Aya Nakamura', 'Dadju'],
      ['Ed Sheeran', 'Bruno Mars'],
      ['Beyoncé', 'Alicia Keys'],
      ['Jul', 'Ninho'],
      ['Adele', 'Billie Eilish'],
      ['Daft Punk', 'Justice'],
    ],
  },
  {
    id: 'footballeurs',
    label: 'Footballeurs',
    emoji: '⚽',
    pairs: [
      ['Messi', 'Ronaldo'],
      ['Mbappé', 'Haaland'],
      ['Neymar', 'Griezmann'],
      ['Zidane', 'Ronaldinho'],
      ['Mbappé', 'Vinicius Jr'],
      ['Benzema', 'Giroud'],
      ['Modric', 'De Bruyne'],
      ['Lewandowski', 'Haaland'],
      ['Maradona', 'Pelé'],
      ['Salah', 'Son'],
    ],
  },
  {
    id: 'sportifs',
    label: 'Sportifs (autres sports)',
    emoji: '🏆',
    pairs: [
      ['LeBron James', 'Michael Jordan'],
      ['Federer', 'Nadal'],
      ['Usain Bolt', 'Michael Phelps'],
      ['Serena Williams', 'Venus Williams'],
      ['Tony Parker', 'Victor Wembanyama'],
      ['Teddy Riner', 'Yannick Noah'],
      ['Kobe Bryant', 'Shaquille O’Neal'],
      ['Lewis Hamilton', 'Max Verstappen'],
      ['Simone Biles', 'Nadia Comaneci'],
      ['Novak Djokovic', 'Rafael Nadal'],
    ],
  },
]

export function getPackById(id: string): WordPack | undefined {
  return wordPacks.find((p) => p.id === id)
}
