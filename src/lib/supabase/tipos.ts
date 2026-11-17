
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "administradores": {
                  Row: {
                    "creado_el": string,"usuario_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "creado_el"?: string,"usuario_id": string
                  }
                  Update: {
                    "creado_el"?: string,"usuario_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "administradores_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: true
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"empresa_miembros": {
                  Row: {
                    "creado_el": string,"empresa_id": string,"usuario_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "creado_el"?: string,"empresa_id": string,"usuario_id": string
                  }
                  Update: {
                    "creado_el"?: string,"empresa_id"?: string,"usuario_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "empresa_miembros_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "empresa_miembros_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"empresas": {
                  Row: {
                    "creado_el": string,"creado_por": string | null,"es_demo": boolean,"id": string,"nombre": string,"partner_id": string | null,"plantilla_declarada": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "creado_el"?: string,"creado_por"?: string | null,"es_demo"?: boolean,"id"?: string,"nombre": string,"partner_id"?: string | null,"plantilla_declarada"?: number | null
                  }
                  Update: {
                    "creado_el"?: string,"creado_por"?: string | null,"es_demo"?: boolean,"id"?: string,"nombre"?: string,"partner_id"?: string | null,"plantilla_declarada"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "empresas_creado_por_fkey"
      columns: ["creado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "empresas_partner_id_fkey"
      columns: ["partner_id"]
isOneToOne: false
      referencedRelation: "partners"
      referencedColumns: ["id"]
    }
                  ]
                },"invitaciones": {
                  Row: {
                    "aceptada_el": string | null,"correo": string,"creada_el": string,"creada_por": string | null,"empresa_id": string | null,"id": string,"partner_id": string | null,"rol": Database["public"]['Enums']["rol_invitacion"]
                  }
                  ComputedFields: never
                  Insert: {
                    "aceptada_el"?: string | null,"correo": string,"creada_el"?: string,"creada_por"?: string | null,"empresa_id"?: string | null,"id"?: string,"partner_id"?: string | null,"rol": Database["public"]['Enums']["rol_invitacion"]
                  }
                  Update: {
                    "aceptada_el"?: string | null,"correo"?: string,"creada_el"?: string,"creada_por"?: string | null,"empresa_id"?: string | null,"id"?: string,"partner_id"?: string | null,"rol"?: Database["public"]['Enums']["rol_invitacion"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "invitaciones_creada_por_fkey"
      columns: ["creada_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitaciones_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "invitaciones_partner_id_fkey"
      columns: ["partner_id"]
isOneToOne: false
      referencedRelation: "partners"
      referencedColumns: ["id"]
    }
                  ]
                },"partner_miembros": {
                  Row: {
                    "creado_el": string,"partner_id": string,"rol": Database["public"]['Enums']["rol_partner"],"usuario_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "creado_el"?: string,"partner_id": string,"rol"?: Database["public"]['Enums']["rol_partner"],"usuario_id": string
                  }
                  Update: {
                    "creado_el"?: string,"partner_id"?: string,"rol"?: Database["public"]['Enums']["rol_partner"],"usuario_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "partner_miembros_partner_id_fkey"
      columns: ["partner_id"]
isOneToOne: false
      referencedRelation: "partners"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "partner_miembros_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"partners": {
                  Row: {
                    "creado_el": string,"es_demo": boolean,"id": string,"marca_blanca": boolean,"marca_logo_ruta": string | null,"marca_nombre": string | null,"nombre": string
                  }
                  ComputedFields: never
                  Insert: {
                    "creado_el"?: string,"es_demo"?: boolean,"id"?: string,"marca_blanca"?: boolean,"marca_logo_ruta"?: string | null,"marca_nombre"?: string | null,"nombre": string
                  }
                  Update: {
                    "creado_el"?: string,"es_demo"?: boolean,"id"?: string,"marca_blanca"?: boolean,"marca_logo_ruta"?: string | null,"marca_nombre"?: string | null,"nombre"?: string
                  }
                  Relationships: [
                    
                  ]
                },"pendientes": {
                  Row: {
                    "clave": string,"creado_el": string,"descripcion": string,"id": string,"modulo": string,"resuelto_el": string | null,"resuelto_por": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "clave": string,"creado_el"?: string,"descripcion": string,"id"?: string,"modulo": string,"resuelto_el"?: string | null,"resuelto_por"?: string | null
                  }
                  Update: {
                    "clave"?: string,"creado_el"?: string,"descripcion"?: string,"id"?: string,"modulo"?: string,"resuelto_el"?: string | null,"resuelto_por"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "pendientes_resuelto_por_fkey"
      columns: ["resuelto_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"perfiles": {
                  Row: {
                    "correo": string,"creado_el": string,"id": string,"nombre": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "correo": string,"creado_el"?: string,"id": string,"nombre"?: string | null
                  }
                  Update: {
                    "correo"?: string,"creado_el"?: string,"id"?: string,"nombre"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"tecnico_empresas": {
                  Row: {
                    "creado_el": string,"empresa_id": string,"usuario_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "creado_el"?: string,"empresa_id": string,"usuario_id": string
                  }
                  Update: {
                    "creado_el"?: string,"empresa_id"?: string,"usuario_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "tecnico_empresas_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "tecnico_empresas_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "consumir_intento":
{ Args: { "p_clave": string,"p_max": number,"p_ventana_segundos": number }; Returns: boolean
                           },
"correo_puede_acceder":
{ Args: { "p_correo": string }; Returns: boolean
                           },
"marca_de_empresa":
{ Args: { "p_empresa": string }; Returns: {
              "logo_ruta": string,"nombre": string
            }[]
                           }
          }
          Enums: {
            "rol_invitacion": "admin"|"partner"|"tecnico"|"empresa","rol_partner": "gestor"|"tecnico"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "rol_invitacion": ["admin", "partner", "tecnico", "empresa"],"rol_partner": ["gestor", "tecnico"]
          }
        }
} as const
