import { createPool } from './config.js';
import { v4 as uuidv4 } from 'uuid';

const pool = createPool();

export interface Superhero {
  id: string;
  name: string;
  superpower: string;
  humilityScore: number;
  avatar: string;
}

export interface CreateSuperhero {
  name: string;
  superpower: string;
  humilityScore: number;
}

export class SuperheroService {
  static async createSuperhero(superheroData: CreateSuperhero): Promise<Superhero> {
    const id = uuidv4();
    const avatar = `https://api.dicebear.com/9.x/notionists/svg?scale=100&seed=${encodeURIComponent(superheroData.name)}`;
    
    const superhero: Superhero = {
      id,
      ...superheroData,
      avatar,
    };
    
    try {
      await pool.execute(
        'INSERT INTO superheroes (id, name, superpower, humilityScore, avatar) VALUES (?, ?, ?, ?, ?)',
        [superhero.id, superhero.name, superhero.superpower, superhero.humilityScore, superhero.avatar]
      );
      
      return superhero;
    } catch (error) {
      console.error('Error creating superhero:', error);
      throw new Error('Failed to create superhero');
    }
  }
  
  static async getAllSuperheroes(): Promise<Superhero[]> {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, superpower, humilityScore, avatar FROM superheroes ORDER BY humilityScore DESC'
      );
      
      return rows as Superhero[];
    } catch (error) {
      console.error('Error fetching superheroes:', error);
      throw new Error('Failed to fetch superheroes');
    }
  }
  
  static async getSuperheroById(id: string): Promise<Superhero | null> {
    try {
      const [rows] = await pool.execute(
        'SELECT id, name, superpower, humilityScore, avatar FROM superheroes WHERE id = ?',
        [id]
      );
      
      const superheroes = rows as Superhero[];
      return superheroes.length > 0 ? superheroes[0] : null;
    } catch (error) {
      console.error('Error fetching superhero by id:', error);
      throw new Error('Failed to fetch superhero');
    }
  }
  
  static async updateSuperhero(id: string, superheroData: Partial<CreateSuperhero>): Promise<Superhero | null> {
    try {
      const existingSuperhero = await this.getSuperheroById(id);
      if (!existingSuperhero) {
        return null;
      }
      
      const updatedData = { ...existingSuperhero, ...superheroData };
      
      await pool.execute(
        'UPDATE superheroes SET name = ?, superpower = ?, humilityScore = ? WHERE id = ?',
        [updatedData.name, updatedData.superpower, updatedData.humilityScore, id]
      );
      
      return await this.getSuperheroById(id);
    } catch (error) {
      console.error('Error updating superhero:', error);
      throw new Error('Failed to update superhero');
    }
  }
  
  static async deleteSuperhero(id: string): Promise<Superhero | null> {
    try {
      const superhero = await this.getSuperheroById(id);
      if (!superhero) {
        return null;
      }
      
      await pool.execute('DELETE FROM superheroes WHERE id = ?', [id]);
      return superhero;
    } catch (error) {
      console.error('Error deleting superhero:', error);
      throw new Error('Failed to delete superhero');
    }
  }
  
  static async seedInitialData(): Promise<void> {
    try {
      const [rows] = await pool.execute('SELECT COUNT(*) as count FROM superheroes');
      const count = (rows as any)[0].count;
      
      if (count === 0) {
        const initialSuperheroes = [
          {
            name: "Captain Humility",
            superpower: "Self-awareness",
            humilityScore: 10,
          },
          {
            name: "Modesty Woman",
            superpower: "Power Reflection",
            humilityScore: 9,
          },
          {
            name: "Honest Arrow",
            superpower: "Truth Perception",
            humilityScore: 8,
          },
        ];
        
        for (const superhero of initialSuperheroes) {
          await this.createSuperhero(superhero);
        }
        
        console.log('Initial superhero data seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  }
}