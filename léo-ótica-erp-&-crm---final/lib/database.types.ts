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
            profiles: {
                Row: {
                    id: string
                    username: string
                    name: string
                    role: 'admin' | 'employee'
                    created_at: string
                }
                Insert: {
                    id: string
                    username: string
                    name: string
                    role: 'admin' | 'employee'
                    created_at?: string
                }
                Update: {
                    id?: string
                    username?: string
                    name?: string
                    role?: 'admin' | 'employee'
                    created_at?: string
                }
            }
            clients: {
                Row: {
                    id: number
                    name: string
                    phone: string
                    address: string | null
                    last_visit: string | null
                    nps_score: number | null
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: number
                    name: string
                    phone: string
                    address?: string | null
                    last_visit?: string | null
                    nps_score?: number | null
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: number
                    name?: string
                    phone?: string
                    address?: string | null
                    last_visit?: string | null
                    nps_score?: number | null
                    created_at?: string
                    user_id?: string
                }
            }
            products: {
                Row: {
                    id: number
                    name: string
                    sku: string
                    type: string
                    brand: string
                    price: number
                    cost_price: number
                    stock: number
                    min_stock: number
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: number
                    name: string
                    sku: string
                    type: string
                    brand: string
                    price: number
                    cost_price: number
                    stock?: number
                    min_stock?: number
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: number
                    name?: string
                    sku?: string
                    type?: string
                    brand?: string
                    price?: number
                    cost_price?: number
                    stock?: number
                    min_stock?: number
                    created_at?: string
                    user_id?: string
                }
            }
            service_orders: {
                Row: {
                    id: number
                    client_id: number | null
                    client_name: string
                    total_value: number
                    status: string
                    created_at: string
                    delivery_date: string | null
                    items: Json
                    user_id: string
                }
                Insert: {
                    id?: number
                    client_id?: number | null
                    client_name: string
                    total_value: number
                    status: string
                    created_at?: string
                    delivery_date?: string | null
                    items: Json
                    user_id: string
                }
                Update: {
                    id?: number
                    client_id?: number | null
                    client_name?: string
                    total_value?: number
                    status?: string
                    created_at?: string
                    delivery_date?: string | null
                    items?: Json
                    user_id?: string
                }
            }
            transactions: {
                Row: {
                    id: number
                    description: string
                    amount: number
                    type: 'INCOME' | 'EXPENSE'
                    category: string
                    date: string
                    payment_method: string
                    status: string
                    created_at: string
                    user_id: string
                }
                Insert: {
                    id?: number
                    description: string
                    amount: number
                    type: 'INCOME' | 'EXPENSE'
                    category: string
                    date: string
                    payment_method: string
                    status: string
                    created_at?: string
                    user_id: string
                }
                Update: {
                    id?: number
                    description?: string
                    amount?: number
                    type?: 'INCOME' | 'EXPENSE'
                    category?: string
                    date?: string
                    payment_method?: string
                    status?: string
                    created_at?: string
                    user_id?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            [_ in never]: never
        }
    }
}
