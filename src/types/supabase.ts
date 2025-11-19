/**
 * Tipos de la base de datos Supabase
 * Para generar tipos actualizados ejecutar:
 * npx supabase gen types typescript --local > src/types/supabase.ts
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            [key: string]: {
                Row: { [key: string]: any }
                Insert: { [key: string]: any }
                Update: { [key: string]: any }
            }
        }
        Views: {
            [key: string]: {
                Row: { [key: string]: any }
            }
        }
        Functions: {
            [key: string]: {
                Args: { [key: string]: any }
                Returns: any
            }
        }
        Enums: {
            [key: string]: string
        }
    }
}
