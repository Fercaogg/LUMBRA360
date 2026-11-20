
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
            "acuses": {
                  Row: {
                    "id": string,"nombre": string,"politica_id": string,"registrado_el": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"nombre": string,"politica_id": string,"registrado_el"?: string
                  }
                  Update: {
                    "id"?: string,"nombre"?: string,"politica_id"?: string,"registrado_el"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "acuses_politica_id_fkey"
      columns: ["politica_id"]
isOneToOne: false
      referencedRelation: "politicas"
      referencedColumns: ["id"]
    }
                  ]
                },"administradores": {
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
                },"audiencias": {
                  Row: {
                    "acta_nombre": string | null,"acta_ruta": string | null,"acta_sha256": string | null,"asistentes": string,"creada_el": string,"creada_por": string | null,"empresa_id": string,"fecha": string,"id": string,"notas": string | null,"politica_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "acta_nombre"?: string | null,"acta_ruta"?: string | null,"acta_sha256"?: string | null,"asistentes": string,"creada_el"?: string,"creada_por"?: string | null,"empresa_id": string,"fecha": string,"id"?: string,"notas"?: string | null,"politica_id"?: string | null
                  }
                  Update: {
                    "acta_nombre"?: string | null,"acta_ruta"?: string | null,"acta_sha256"?: string | null,"asistentes"?: string,"creada_el"?: string,"creada_por"?: string | null,"empresa_id"?: string,"fecha"?: string,"id"?: string,"notas"?: string | null,"politica_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audiencias_creada_por_fkey"
      columns: ["creada_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "audiencias_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "audiencias_politica_id_fkey"
      columns: ["politica_id"]
isOneToOne: false
      referencedRelation: "politicas"
      referencedColumns: ["id"]
    }
                  ]
                },"campana_dimensiones": {
                  Row: {
                    "campana_id": string,"dimension_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "campana_id": string,"dimension_id": string
                  }
                  Update: {
                    "campana_id"?: string,"dimension_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "campana_dimensiones_campana_id_fkey"
      columns: ["campana_id"]
isOneToOne: false
      referencedRelation: "campanas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "campana_dimensiones_dimension_id_fkey"
      columns: ["dimension_id"]
isOneToOne: false
      referencedRelation: "dimensiones"
      referencedColumns: ["id"]
    }
                  ]
                },"campanas": {
                  Row: {
                    "abierta_el": string | null,"cerrada_el": string | null,"creada_el": string,"creada_por": string | null,"empresa_id": string,"estado": Database["public"]['Enums']["estado_campana"],"id": string,"instrumento_id": string,"minimo_grupo": number,"modo_acceso": Database["public"]['Enums']["modo_acceso"],"nombre": string,"plantilla_invitada": number | null,"tipo": Database["public"]['Enums']["tipo_instrumento"],"token_enlace": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "abierta_el"?: string | null,"cerrada_el"?: string | null,"creada_el"?: string,"creada_por"?: string | null,"empresa_id": string,"estado"?: Database["public"]['Enums']["estado_campana"],"id"?: string,"instrumento_id": string,"minimo_grupo"?: number,"modo_acceso"?: Database["public"]['Enums']["modo_acceso"],"nombre": string,"plantilla_invitada"?: number | null,"tipo"?: Database["public"]['Enums']["tipo_instrumento"],"token_enlace"?: string | null
                  }
                  Update: {
                    "abierta_el"?: string | null,"cerrada_el"?: string | null,"creada_el"?: string,"creada_por"?: string | null,"empresa_id"?: string,"estado"?: Database["public"]['Enums']["estado_campana"],"id"?: string,"instrumento_id"?: string,"minimo_grupo"?: number,"modo_acceso"?: Database["public"]['Enums']["modo_acceso"],"nombre"?: string,"plantilla_invitada"?: number | null,"tipo"?: Database["public"]['Enums']["tipo_instrumento"],"token_enlace"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "campanas_creada_por_fkey"
      columns: ["creada_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "campanas_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "campanas_instrumento_id_fkey"
      columns: ["instrumento_id"]
isOneToOne: false
      referencedRelation: "instrumentos"
      referencedColumns: ["id"]
    }
                  ]
                },"codigos_acceso": {
                  Row: {
                    "campana_id": string,"codigo_hash": string,"id": string,"usado": boolean
                  }
                  ComputedFields: never
                  Insert: {
                    "campana_id": string,"codigo_hash": string,"id"?: string,"usado"?: boolean
                  }
                  Update: {
                    "campana_id"?: string,"codigo_hash"?: string,"id"?: string,"usado"?: boolean
                  }
                  Relationships: [
                    {
      foreignKeyName: "codigos_acceso_campana_id_fkey"
      columns: ["campana_id"]
isOneToOne: false
      referencedRelation: "campanas"
      referencedColumns: ["id"]
    }
                  ]
                },"dimensiones": {
                  Row: {
                    "empresa_id": string,"id": string,"nombre": string
                  }
                  ComputedFields: never
                  Insert: {
                    "empresa_id": string,"id"?: string,"nombre": string
                  }
                  Update: {
                    "empresa_id"?: string,"id"?: string,"nombre"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "dimensiones_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
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
                },"escala_opciones": {
                  Row: {
                    "codigo_export": string | null,"escala_id": string,"etiqueta": string,"id": string,"orden": number,"valor": number
                  }
                  ComputedFields: never
                  Insert: {
                    "codigo_export"?: string | null,"escala_id": string,"etiqueta": string,"id"?: string,"orden"?: number,"valor": number
                  }
                  Update: {
                    "codigo_export"?: string | null,"escala_id"?: string,"etiqueta"?: string,"id"?: string,"orden"?: number,"valor"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "escala_opciones_escala_id_fkey"
      columns: ["escala_id"]
isOneToOne: false
      referencedRelation: "escalas"
      referencedColumns: ["id"]
    }
                  ]
                },"escalas": {
                  Row: {
                    "id": string,"instrumento_id": string,"nombre": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"instrumento_id": string,"nombre": string
                  }
                  Update: {
                    "id"?: string,"instrumento_id"?: string,"nombre"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "escalas_instrumento_id_fkey"
      columns: ["instrumento_id"]
isOneToOne: false
      referencedRelation: "instrumentos"
      referencedColumns: ["id"]
    }
                  ]
                },"evidencias": {
                  Row: {
                    "autor": string | null,"detalle": NonNullable<Json>,"empresa_id": string,"id": string,"ocurrido_el": string,"tipo": string,"titulo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "autor"?: string | null,"detalle"?: NonNullable<Json>,"empresa_id": string,"id"?: string,"ocurrido_el"?: string,"tipo": string,"titulo": string
                  }
                  Update: {
                    "autor"?: string | null,"detalle"?: NonNullable<Json>,"empresa_id"?: string,"id"?: string,"ocurrido_el"?: string,"tipo"?: string,"titulo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "evidencias_autor_fkey"
      columns: ["autor"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "evidencias_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    }
                  ]
                },"factores": {
                  Row: {
                    "descripcion": string | null,"id": string,"instrumento_id": string,"metodo": Database["public"]['Enums']["metodo_puntuacion"],"nombre": string,"orden": number
                  }
                  ComputedFields: never
                  Insert: {
                    "descripcion"?: string | null,"id"?: string,"instrumento_id": string,"metodo"?: Database["public"]['Enums']["metodo_puntuacion"],"nombre": string,"orden"?: number
                  }
                  Update: {
                    "descripcion"?: string | null,"id"?: string,"instrumento_id"?: string,"metodo"?: Database["public"]['Enums']["metodo_puntuacion"],"nombre"?: string,"orden"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "factores_instrumento_id_fkey"
      columns: ["instrumento_id"]
isOneToOne: false
      referencedRelation: "instrumentos"
      referencedColumns: ["id"]
    }
                  ]
                },"formaciones": {
                  Row: {
                    "creada_el": string,"creada_por": string | null,"descripcion": string | null,"documento_nombre": string | null,"documento_ruta": string | null,"documento_sha256": string | null,"empresa_id": string,"fecha": string,"id": string,"participantes": number | null,"titulo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "creada_el"?: string,"creada_por"?: string | null,"descripcion"?: string | null,"documento_nombre"?: string | null,"documento_ruta"?: string | null,"documento_sha256"?: string | null,"empresa_id": string,"fecha": string,"id"?: string,"participantes"?: number | null,"titulo": string
                  }
                  Update: {
                    "creada_el"?: string,"creada_por"?: string | null,"descripcion"?: string | null,"documento_nombre"?: string | null,"documento_ruta"?: string | null,"documento_sha256"?: string | null,"empresa_id"?: string,"fecha"?: string,"id"?: string,"participantes"?: number | null,"titulo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "formaciones_creada_por_fkey"
      columns: ["creada_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "formaciones_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    }
                  ]
                },"grupos": {
                  Row: {
                    "dimension_id": string,"id": string,"nombre": string,"orden": number
                  }
                  ComputedFields: never
                  Insert: {
                    "dimension_id": string,"id"?: string,"nombre": string,"orden"?: number
                  }
                  Update: {
                    "dimension_id"?: string,"id"?: string,"nombre"?: string,"orden"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "grupos_dimension_id_fkey"
      columns: ["dimension_id"]
isOneToOne: false
      referencedRelation: "dimensiones"
      referencedColumns: ["id"]
    }
                  ]
                },"informe_observaciones": {
                  Row: {
                    "autor": string | null,"creado_el": string,"factor_id": string | null,"id": string,"informe_id": string,"texto": string
                  }
                  ComputedFields: never
                  Insert: {
                    "autor"?: string | null,"creado_el"?: string,"factor_id"?: string | null,"id"?: string,"informe_id": string,"texto": string
                  }
                  Update: {
                    "autor"?: string | null,"creado_el"?: string,"factor_id"?: string | null,"id"?: string,"informe_id"?: string,"texto"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "informe_observaciones_autor_fkey"
      columns: ["autor"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "informe_observaciones_factor_id_fkey"
      columns: ["factor_id"]
isOneToOne: false
      referencedRelation: "factores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "informe_observaciones_informe_id_fkey"
      columns: ["informe_id"]
isOneToOne: false
      referencedRelation: "informes"
      referencedColumns: ["id"]
    }
                  ]
                },"informes": {
                  Row: {
                    "campana_id": string,"creado_el": string,"creado_por": string | null,"datos": Json | null,"documento_nombre": string | null,"documento_ruta": string | null,"documento_sha256": string | null,"documento_subido_el": string | null,"estado": Database["public"]['Enums']["estado_informe"],"firmado_el": string | null,"firmado_por": string | null,"firmante_nombre": string | null,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "campana_id": string,"creado_el"?: string,"creado_por"?: string | null,"datos"?: Json | null,"documento_nombre"?: string | null,"documento_ruta"?: string | null,"documento_sha256"?: string | null,"documento_subido_el"?: string | null,"estado"?: Database["public"]['Enums']["estado_informe"],"firmado_el"?: string | null,"firmado_por"?: string | null,"firmante_nombre"?: string | null,"id"?: string
                  }
                  Update: {
                    "campana_id"?: string,"creado_el"?: string,"creado_por"?: string | null,"datos"?: Json | null,"documento_nombre"?: string | null,"documento_ruta"?: string | null,"documento_sha256"?: string | null,"documento_subido_el"?: string | null,"estado"?: Database["public"]['Enums']["estado_informe"],"firmado_el"?: string | null,"firmado_por"?: string | null,"firmante_nombre"?: string | null,"id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "informes_campana_id_fkey"
      columns: ["campana_id"]
isOneToOne: true
      referencedRelation: "campanas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "informes_creado_por_fkey"
      columns: ["creado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "informes_firmado_por_fkey"
      columns: ["firmado_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    }
                  ]
                },"instrumentos": {
                  Row: {
                    "creado_el": string,"descripcion": string | null,"es_demo": boolean,"estado": Database["public"]['Enums']["estado_instrumento"],"export_cabecera": string | null,"export_confirmado": boolean,"export_fin_linea": string,"export_formato": string,"export_separador": string,"id": string,"licencia_confirmada": boolean,"licencia_nota": string | null,"minutos_estimados": number | null,"nombre": string,"origen": Database["public"]['Enums']["origen_instrumento"],"tipo": Database["public"]['Enums']["tipo_instrumento"]
                  }
                  ComputedFields: never
                  Insert: {
                    "creado_el"?: string,"descripcion"?: string | null,"es_demo"?: boolean,"estado"?: Database["public"]['Enums']["estado_instrumento"],"export_cabecera"?: string | null,"export_confirmado"?: boolean,"export_fin_linea"?: string,"export_formato"?: string,"export_separador"?: string,"id"?: string,"licencia_confirmada"?: boolean,"licencia_nota"?: string | null,"minutos_estimados"?: number | null,"nombre": string,"origen"?: Database["public"]['Enums']["origen_instrumento"],"tipo"?: Database["public"]['Enums']["tipo_instrumento"]
                  }
                  Update: {
                    "creado_el"?: string,"descripcion"?: string | null,"es_demo"?: boolean,"estado"?: Database["public"]['Enums']["estado_instrumento"],"export_cabecera"?: string | null,"export_confirmado"?: boolean,"export_fin_linea"?: string,"export_formato"?: string,"export_separador"?: string,"id"?: string,"licencia_confirmada"?: boolean,"licencia_nota"?: string | null,"minutos_estimados"?: number | null,"nombre"?: string,"origen"?: Database["public"]['Enums']["origen_instrumento"],"tipo"?: Database["public"]['Enums']["tipo_instrumento"]
                  }
                  Relationships: [
                    
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
                },"items": {
                  Row: {
                    "enunciado": string,"escala_id": string,"factor_id": string,"id": string,"instrumento_id": string,"invertido": boolean,"orden": number
                  }
                  ComputedFields: never
                  Insert: {
                    "enunciado": string,"escala_id": string,"factor_id": string,"id"?: string,"instrumento_id": string,"invertido"?: boolean,"orden"?: number
                  }
                  Update: {
                    "enunciado"?: string,"escala_id"?: string,"factor_id"?: string,"id"?: string,"instrumento_id"?: string,"invertido"?: boolean,"orden"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "items_escala_id_fkey"
      columns: ["escala_id"]
isOneToOne: false
      referencedRelation: "escalas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "items_factor_id_fkey"
      columns: ["factor_id"]
isOneToOne: false
      referencedRelation: "factores"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "items_instrumento_id_fkey"
      columns: ["instrumento_id"]
isOneToOne: false
      referencedRelation: "instrumentos"
      referencedColumns: ["id"]
    }
                  ]
                },"medida_historial": {
                  Row: {
                    "antes": string | null,"autor": string | null,"campo": string,"cuando": string,"despues": string | null,"id": string,"medida_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "antes"?: string | null,"autor"?: string | null,"campo": string,"cuando"?: string,"despues"?: string | null,"id"?: string,"medida_id": string
                  }
                  Update: {
                    "antes"?: string | null,"autor"?: string | null,"campo"?: string,"cuando"?: string,"despues"?: string | null,"id"?: string,"medida_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "medida_historial_autor_fkey"
      columns: ["autor"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "medida_historial_medida_id_fkey"
      columns: ["medida_id"]
isOneToOne: false
      referencedRelation: "medidas"
      referencedColumns: ["id"]
    }
                  ]
                },"medidas": {
                  Row: {
                    "campana_id": string | null,"creada_el": string,"creada_por": string | null,"descripcion": string | null,"empresa_id": string,"estado": Database["public"]['Enums']["estado_medida"],"factor_id": string | null,"fecha_prevista": string | null,"id": string,"responsable": string | null,"titulo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "campana_id"?: string | null,"creada_el"?: string,"creada_por"?: string | null,"descripcion"?: string | null,"empresa_id": string,"estado"?: Database["public"]['Enums']["estado_medida"],"factor_id"?: string | null,"fecha_prevista"?: string | null,"id"?: string,"responsable"?: string | null,"titulo": string
                  }
                  Update: {
                    "campana_id"?: string | null,"creada_el"?: string,"creada_por"?: string | null,"descripcion"?: string | null,"empresa_id"?: string,"estado"?: Database["public"]['Enums']["estado_medida"],"factor_id"?: string | null,"fecha_prevista"?: string | null,"id"?: string,"responsable"?: string | null,"titulo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "medidas_campana_id_fkey"
      columns: ["campana_id"]
isOneToOne: false
      referencedRelation: "campanas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "medidas_creada_por_fkey"
      columns: ["creada_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "medidas_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "medidas_factor_id_fkey"
      columns: ["factor_id"]
isOneToOne: false
      referencedRelation: "factores"
      referencedColumns: ["id"]
    }
                  ]
                },"niveles": {
                  Row: {
                    "desde": number,"etiqueta": string,"factor_id": string,"id": string,"tono": Database["public"]['Enums']["tono_nivel"]
                  }
                  ComputedFields: never
                  Insert: {
                    "desde": number,"etiqueta": string,"factor_id": string,"id"?: string,"tono"?: Database["public"]['Enums']["tono_nivel"]
                  }
                  Update: {
                    "desde"?: number,"etiqueta"?: string,"factor_id"?: string,"id"?: string,"tono"?: Database["public"]['Enums']["tono_nivel"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "niveles_factor_id_fkey"
      columns: ["factor_id"]
isOneToOne: false
      referencedRelation: "factores"
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
                },"politica_plantilla_secciones": {
                  Row: {
                    "ayuda": string | null,"cuerpo": string,"id": string,"orden": number,"plantilla_id": string,"titulo": string
                  }
                  ComputedFields: never
                  Insert: {
                    "ayuda"?: string | null,"cuerpo"?: string,"id"?: string,"orden"?: number,"plantilla_id": string,"titulo": string
                  }
                  Update: {
                    "ayuda"?: string | null,"cuerpo"?: string,"id"?: string,"orden"?: number,"plantilla_id"?: string,"titulo"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "politica_plantilla_secciones_plantilla_id_fkey"
      columns: ["plantilla_id"]
isOneToOne: false
      referencedRelation: "politica_plantillas"
      referencedColumns: ["id"]
    }
                  ]
                },"politica_plantillas": {
                  Row: {
                    "creado_el": string,"es_demo": boolean,"estado": Database["public"]['Enums']["estado_instrumento"],"id": string,"nombre": string,"revisada_juridicamente": boolean,"revision_nota": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "creado_el"?: string,"es_demo"?: boolean,"estado"?: Database["public"]['Enums']["estado_instrumento"],"id"?: string,"nombre": string,"revisada_juridicamente"?: boolean,"revision_nota"?: string | null
                  }
                  Update: {
                    "creado_el"?: string,"es_demo"?: boolean,"estado"?: Database["public"]['Enums']["estado_instrumento"],"id"?: string,"nombre"?: string,"revisada_juridicamente"?: boolean,"revision_nota"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"politicas": {
                  Row: {
                    "aprobada_el": string | null,"aprobada_nombre": string | null,"aprobada_por": string | null,"creada_el": string,"creada_por": string | null,"empresa_id": string,"estado": Database["public"]['Enums']["estado_politica"],"id": string,"plantilla_id": string | null,"secciones": NonNullable<Json>,"token_acuse": string | null,"version": number
                  }
                  ComputedFields: never
                  Insert: {
                    "aprobada_el"?: string | null,"aprobada_nombre"?: string | null,"aprobada_por"?: string | null,"creada_el"?: string,"creada_por"?: string | null,"empresa_id": string,"estado"?: Database["public"]['Enums']["estado_politica"],"id"?: string,"plantilla_id"?: string | null,"secciones"?: NonNullable<Json>,"token_acuse"?: string | null,"version": number
                  }
                  Update: {
                    "aprobada_el"?: string | null,"aprobada_nombre"?: string | null,"aprobada_por"?: string | null,"creada_el"?: string,"creada_por"?: string | null,"empresa_id"?: string,"estado"?: Database["public"]['Enums']["estado_politica"],"id"?: string,"plantilla_id"?: string | null,"secciones"?: NonNullable<Json>,"token_acuse"?: string | null,"version"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "politicas_aprobada_por_fkey"
      columns: ["aprobada_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "politicas_creada_por_fkey"
      columns: ["creada_por"]
isOneToOne: false
      referencedRelation: "perfiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "politicas_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "politicas_plantilla_id_fkey"
      columns: ["plantilla_id"]
isOneToOne: false
      referencedRelation: "politica_plantillas"
      referencedColumns: ["id"]
    }
                  ]
                },"respuesta_grupos": {
                  Row: {
                    "grupo_id": string,"respuesta_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "grupo_id": string,"respuesta_id": string
                  }
                  Update: {
                    "grupo_id"?: string,"respuesta_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "respuesta_grupos_grupo_id_fkey"
      columns: ["grupo_id"]
isOneToOne: false
      referencedRelation: "grupos"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "respuesta_grupos_respuesta_id_fkey"
      columns: ["respuesta_id"]
isOneToOne: false
      referencedRelation: "respuestas"
      referencedColumns: ["id"]
    }
                  ]
                },"respuesta_items": {
                  Row: {
                    "item_id": string,"respuesta_id": string,"valor": number
                  }
                  ComputedFields: never
                  Insert: {
                    "item_id": string,"respuesta_id": string,"valor": number
                  }
                  Update: {
                    "item_id"?: string,"respuesta_id"?: string,"valor"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "respuesta_items_item_id_fkey"
      columns: ["item_id"]
isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "respuesta_items_respuesta_id_fkey"
      columns: ["respuesta_id"]
isOneToOne: false
      referencedRelation: "respuestas"
      referencedColumns: ["id"]
    }
                  ]
                },"respuestas": {
                  Row: {
                    "campana_id": string,"dia": string,"id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "campana_id": string,"dia"?: string,"id"?: string
                  }
                  Update: {
                    "campana_id"?: string,"dia"?: string,"id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "respuestas_campana_id_fkey"
      columns: ["campana_id"]
isOneToOne: false
      referencedRelation: "campanas"
      referencedColumns: ["id"]
    }
                  ]
                },"solicitudes_demo": {
                  Row: {
                    "acepta_novedades": boolean,"correo": string,"creada_el": string,"id": string,"nombre": string
                  }
                  ComputedFields: never
                  Insert: {
                    "acepta_novedades"?: boolean,"correo": string,"creada_el"?: string,"id"?: string,"nombre": string
                  }
                  Update: {
                    "acepta_novedades"?: boolean,"correo"?: string,"creada_el"?: string,"id"?: string,"nombre"?: string
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
                },"visores_demo": {
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
      foreignKeyName: "visores_demo_empresa_id_fkey"
      columns: ["empresa_id"]
isOneToOne: false
      referencedRelation: "empresas"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "visores_demo_usuario_id_fkey"
      columns: ["usuario_id"]
isOneToOne: true
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
            "abrir_campana":
{ Args: { "p_campana": string }; Returns: undefined
                           },
"adjuntar_informe":
{ Args: { "p_informe": string,"p_nombre": string,"p_ruta": string,"p_sha256": string }; Returns: undefined
                           },
"aprobar_politica":
{ Args: { "p_nombre": string,"p_politica": string }; Returns: undefined
                           },
"borrar_empresa_completa":
{ Args: { "p_empresa": string }; Returns: undefined
                           },
"cambiar_acuse":
{ Args: { "p_abrir": boolean,"p_politica": string }; Returns: undefined
                           },
"cerrar_campana":
{ Args: { "p_campana": string }; Returns: undefined
                           },
"consumir_intento":
{ Args: { "p_clave": string,"p_max": number,"p_ventana_segundos": number }; Returns: boolean
                           },
"correo_puede_acceder":
{ Args: { "p_correo": string }; Returns: boolean
                           },
"enviar_respuesta":
{ Args: { "p_acceso": string,"p_grupos": (string)[],"p_valores": Json }; Returns: string
                           },
"exportar_respuestas":
{ Args: { "p_campana": string }; Returns: Json
                           },
"firmar_informe":
{ Args: { "p_informe": string,"p_nombre": string }; Returns: undefined
                           },
"generar_codigos":
{ Args: { "p_campana": string,"p_cantidad": number }; Returns: string[]
                           },
"grupos_de_campana":
{ Args: { "p_campana": string }; Returns: {
              "dimension": string,"dimension_id": string,"grupo": string,"grupo_id": string,"visible": boolean
            }[]
                           },
"iniciar_politica":
{ Args: { "p_empresa": string,"p_plantilla": string }; Returns: string
                           },
"marca_de_empresa":
{ Args: { "p_empresa": string }; Returns: {
              "logo_ruta": string,"nombre": string
            }[]
                           },
"obtener_cuestionario":
{ Args: { "p_acceso": string }; Returns: Json
                           },
"obtener_politica_acuse":
{ Args: { "p_token": string }; Returns: Json
                           },
"participacion_campana":
{ Args: { "p_campana": string }; Returns: Json
                           },
"preparar_informe":
{ Args: { "p_campana": string }; Returns: string
                           },
"publicar_instrumento":
{ Args: { "p_instrumento": string }; Returns: undefined
                           },
"publicar_plantilla_politica":
{ Args: { "p_plantilla": string }; Returns: undefined
                           },
"registrar_acuse":
{ Args: { "p_nombre": string,"p_token": string }; Returns: string
                           },
"resultados_campana":
{ Args: { "p_campana": string,"p_grupos"?: (string)[] }; Returns: Json
                           },
"retirar_instrumento":
{ Args: { "p_instrumento": string }; Returns: undefined
                           },
"retirar_plantilla_politica":
{ Args: { "p_plantilla": string }; Returns: undefined
                           }
          }
          Enums: {
            "estado_campana": "borrador"|"abierta"|"cerrada","estado_informe": "borrador"|"firmado","estado_instrumento": "borrador"|"publicado"|"retirado","estado_medida": "pendiente"|"en_curso"|"hecha"|"descartada","estado_politica": "borrador"|"aprobada","metodo_puntuacion": "media"|"suma","modo_acceso": "codigos"|"enlace","origen_instrumento": "propio"|"insst_fpsico","rol_invitacion": "admin"|"partner"|"tecnico"|"empresa","rol_partner": "gestor"|"tecnico","tipo_instrumento": "evaluacion"|"pulso","tono_nivel": "favorable"|"intermedio"|"desfavorable"
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
            "estado_campana": ["borrador", "abierta", "cerrada"],"estado_informe": ["borrador", "firmado"],"estado_instrumento": ["borrador", "publicado", "retirado"],"estado_medida": ["pendiente", "en_curso", "hecha", "descartada"],"estado_politica": ["borrador", "aprobada"],"metodo_puntuacion": ["media", "suma"],"modo_acceso": ["codigos", "enlace"],"origen_instrumento": ["propio", "insst_fpsico"],"rol_invitacion": ["admin", "partner", "tecnico", "empresa"],"rol_partner": ["gestor", "tecnico"],"tipo_instrumento": ["evaluacion", "pulso"],"tono_nivel": ["favorable", "intermedio", "desfavorable"]
          }
        }
} as const
