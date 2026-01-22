import pandas as pd
import os
import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from tkcalendar import DateEntry
import supabase
from supabase import create_client, Client
from datetime import datetime, timedelta
import calendar

class AplicacionFiltrado:
    def __init__(self, root):
        self.root = root
        self.root.title("Sistema de Filtrado de Datos CSV")
        self.root.geometry("1200x800")
        self.root.configure(bg='#f0f0f0')
        
        # Centrar la ventana
        self.centrar_ventana()
        
        # Variables para almacenar rutas y selecciones
        self.carpeta_seleccionada = tk.StringVar()
        self.ruta_resultados = tk.StringVar()
        self.centro_seleccionado = tk.StringVar()
        self.zona_seleccionada = tk.StringVar()
        
        # Variables para fechas
        self.fecha_inicio = None
        self.fecha_fin = None
        
        # Variables para días de la semana
        self.dias_semana = {
            'Lunes': tk.BooleanVar(),
            'Martes': tk.BooleanVar(),
            'Miércoles': tk.BooleanVar(),
            'Jueves': tk.BooleanVar(),
            'Viernes': tk.BooleanVar(),
            'Sábado': tk.BooleanVar(),
            'Domingo': tk.BooleanVar()
        }
        
        # Lista para almacenar nodos disponibles y seleccionados
        self.nodos_disponibles = []
        self.nodos_seleccionados = []
        
        # Inicializar el widget log_text como None para evitar errores
        self.log_text = None
        
        # Configuración para Supabase
        self.supabase_url = r"https://uzfsdviemqdyfjrtgyck.supabase.co"
        self.supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6ZnNkdmllbXFkeWZqcnRneWNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyMjMyNTIsImV4cCI6MjA1OTc5OTI1Mn0.qu5hlDZCpmpdTxqLD4ualvdFrUir4UgFjiYe9_MLMLU"
        self.supabase = None
        self.mensajes_pendientes = []
        
        # Inicializar conexión con Supabase
        self.inicializar_supabase()
        
        # Configurar estilos
        self.configurar_estilos()
        
        # Crear interfaz
        self.crear_interfaz()
        
    def centrar_ventana(self):
        """Centra la ventana en la pantalla"""
        self.root.update_idletasks()
        width = self.root.winfo_width()
        height = self.root.winfo_height()
        x = (self.root.winfo_screenwidth() // 2) - (width // 2)
        y = (self.root.winfo_screenheight() // 2) - (height // 2)
        self.root.geometry(f'{width}x{height}+{x}+{y}')
        
    def configurar_estilos(self):
        """Configura los estilos personalizados"""
        self.style = ttk.Style()
        self.style.theme_use('clam')
        
        # Estilo para el título principal
        self.style.configure("Title.TLabel", 
                           font=("Segoe UI", 18, "bold"),
                           foreground="#2c3e50",
                           background="#f0f0f0")
        
        # Estilo para subtítulos
        self.style.configure("Subtitle.TLabel",
                           font=("Segoe UI", 11, "bold"),
                           foreground="#34495e",
                           background="#f0f0f0")
        
        # Estilo para labels normales
        self.style.configure("Normal.TLabel",
                           font=("Segoe UI", 9),
                           foreground="#2c3e50",
                           background="#f0f0f0")
        
        # Estilo para el botón principal
        self.style.configure("Primary.TButton",
                           font=("Segoe UI", 11, "bold"),
                           foreground="white",
                           background="#3498db",
                           borderwidth=0,
                           focuscolor="none")
        
        # Estilo para botones secundarios
        self.style.configure("Secondary.TButton",
                           font=("Segoe UI", 9),
                           foreground="#2c3e50",
                           background="#ecf0f1",
                           borderwidth=1,
                           focuscolor="none")
        
        # Estilo para frames con borde
        self.style.configure("Card.TFrame",
                           background="#ffffff",
                           relief="solid",
                           borderwidth=1)
        
    def inicializar_supabase(self):
        """Inicializa la conexión con Supabase"""
        try:
            self.supabase = create_client(self.supabase_url, self.supabase_key)
            self.mensajes_pendientes.append("✓ Conexión con Supabase establecida correctamente")
        except Exception as e:
            self.mensajes_pendientes.append(f"✗ Error al conectar con Supabase: {e}")
    
    def crear_interfaz(self):
        # Crear canvas y scrollbar para toda la ventana
        canvas = tk.Canvas(self.root, bg='#f0f0f0', highlightthickness=0)
        scrollbar = ttk.Scrollbar(self.root, orient="vertical", command=canvas.yview)
        scrollable_frame = ttk.Frame(canvas, style="Card.TFrame")
        
        scrollable_frame.bind(
            "<Configure>",
            lambda e: canvas.configure(scrollregion=canvas.bbox("all"))
        )
        
        canvas.create_window((0, 0), window=scrollable_frame, anchor="nw")
        canvas.configure(yscrollcommand=scrollbar.set)
        
        # Pack canvas y scrollbar
        canvas.pack(side="left", fill="both", expand=True, padx=20, pady=20)
        scrollbar.pack(side="right", fill="y")
        
        # Frame principal con padding
        main_frame = ttk.Frame(scrollable_frame, padding="30")
        main_frame.pack(fill=tk.BOTH, expand=True)
        
        # Título principal
        title_label = ttk.Label(main_frame, text="🗂️ Sistema de Filtrado de Datos CSV", 
                               style="Title.TLabel")
        title_label.pack(pady=(0, 30))
        
        # === SECCIÓN 1: ARCHIVOS ===
        self.crear_seccion_archivos(main_frame)
        
        # === SECCIÓN 2: FILTROS DE UBICACIÓN ===
        self.crear_seccion_ubicacion(main_frame)
        
        # === SECCIÓN 3: FILTROS DE TIEMPO ===
        self.crear_seccion_tiempo(main_frame)
        
        # === SECCIÓN 4: SELECCIÓN DE NODOS ===
        self.crear_seccion_nodos(main_frame)
        
        # === SECCIÓN 5: PROCESAMIENTO ===
        self.crear_seccion_procesamiento(main_frame)
        
        # === SECCIÓN 6: LOGS ===
        self.crear_seccion_logs(main_frame)
        
        # Cargar centros de control al inicio
        self.cargar_centros_control()
        
        # Bind mouse wheel to canvas
        def _on_mousewheel(event):
            canvas.yview_scroll(int(-1*(event.delta/120)), "units")
        canvas.bind_all("<MouseWheel>", _on_mousewheel)
        
    def crear_seccion_archivos(self, parent):
        """Crea la sección de selección de archivos"""
        frame = ttk.LabelFrame(parent, text="📁 Configuración de Archivos", padding="20")
        frame.pack(fill=tk.X, pady=(0, 20))
        
        # Carpeta de origen
        ttk.Label(frame, text="Carpeta con archivos CSV:", 
                 style="Subtitle.TLabel").grid(row=0, column=0, sticky=tk.W, pady=(0, 5))
        
        frame_carpeta = ttk.Frame(frame)
        frame_carpeta.grid(row=1, column=0, sticky=tk.W+tk.E, pady=(0, 15))
        frame_carpeta.columnconfigure(0, weight=1)
        
        entry_carpeta = ttk.Entry(frame_carpeta, textvariable=self.carpeta_seleccionada, 
                                 font=("Segoe UI", 9), width=70)
        entry_carpeta.grid(row=0, column=0, sticky=tk.W+tk.E, padx=(0, 10))
        
        btn_carpeta = ttk.Button(frame_carpeta, text="📂 Examinar", 
                                command=self.seleccionar_carpeta, style="Secondary.TButton")
        btn_carpeta.grid(row=0, column=1)
        
        # Archivo de destino
        ttk.Label(frame, text="Guardar resultados en:", 
                 style="Subtitle.TLabel").grid(row=2, column=0, sticky=tk.W, pady=(0, 5))
        
        frame_destino = ttk.Frame(frame)
        frame_destino.grid(row=3, column=0, sticky=tk.W+tk.E)
        frame_destino.columnconfigure(0, weight=1)
        
        entry_destino = ttk.Entry(frame_destino, textvariable=self.ruta_resultados, 
                                 font=("Segoe UI", 9), width=70)
        entry_destino.grid(row=0, column=0, sticky=tk.W+tk.E, padx=(0, 10))
        
        btn_destino = ttk.Button(frame_destino, text="💾 Examinar", 
                                command=self.seleccionar_ruta_resultado, style="Secondary.TButton")
        btn_destino.grid(row=0, column=1)
        
    def crear_seccion_ubicacion(self, parent):
        """Crea la sección de filtros de ubicación jerárquica"""
        frame = ttk.LabelFrame(parent, text="🏢 Filtros de Ubicación", padding="20")
        frame.pack(fill=tk.X, pady=(0, 20))
        
        # Grid configuration
        frame.columnconfigure(1, weight=1)
        frame.columnconfigure(3, weight=1)
        frame.columnconfigure(5, weight=1)
        
        # Centro de Control Regional
        ttk.Label(frame, text="Centro de Control:", 
                 style="Normal.TLabel").grid(row=0, column=0, sticky=tk.W, padx=(0, 10))
        self.combo_centro = ttk.Combobox(frame, textvariable=self.centro_seleccionado, 
                                        state="readonly", font=("Segoe UI", 9), width=25)
        self.combo_centro.grid(row=0, column=1, sticky=tk.W+tk.E, padx=(0, 20))
        self.combo_centro.bind('<<ComboboxSelected>>', self.on_centro_seleccionado)
        
        # Zona de Carga
        ttk.Label(frame, text="Zona de Carga:", 
                 style="Normal.TLabel").grid(row=0, column=2, sticky=tk.W, padx=(0, 10))
        self.combo_zona = ttk.Combobox(frame, textvariable=self.zona_seleccionada, 
                                      state="readonly", font=("Segoe UI", 9), width=25)
        self.combo_zona.grid(row=0, column=3, sticky=tk.W+tk.E, padx=(0, 20))
        self.combo_zona.bind('<<ComboboxSelected>>', self.on_zona_seleccionada)
        
        # Botón de búsqueda
        btn_buscar = ttk.Button(frame, text="🔍 Buscar Nodos", 
                               command=self.buscar_nodos, style="Secondary.TButton")
        btn_buscar.grid(row=0, column=4, padx=(0, 10))
        
    def crear_seccion_tiempo(self, parent):
        """Crea la sección de filtros de tiempo"""
        frame = ttk.LabelFrame(parent, text="📅 Filtros de Tiempo", padding="20")
        frame.pack(fill=tk.X, pady=(0, 20))
        
        # Frame para período
        frame_periodo = ttk.Frame(frame)
        frame_periodo.pack(fill=tk.X, pady=(0, 15))
        
        ttk.Label(frame_periodo, text="Período:", 
                 style="Subtitle.TLabel").pack(side=tk.LEFT, padx=(0, 20))
        
        ttk.Label(frame_periodo, text="Desde:", 
                 style="Normal.TLabel").pack(side=tk.LEFT, padx=(0, 5))
        self.fecha_inicio = DateEntry(frame_periodo, width=12, background='darkblue',
                                     foreground='white', borderwidth=2, date_pattern='dd/MM/yyyy')
        self.fecha_inicio.pack(side=tk.LEFT, padx=(0, 20))
        
        ttk.Label(frame_periodo, text="Hasta:", 
                 style="Normal.TLabel").pack(side=tk.LEFT, padx=(0, 5))
        self.fecha_fin = DateEntry(frame_periodo, width=12, background='darkblue',
                                  foreground='white', borderwidth=2, date_pattern='dd/MM/yyyy')
        self.fecha_fin.pack(side=tk.LEFT)
        
        # Frame para días de la semana
        frame_dias = ttk.Frame(frame)
        frame_dias.pack(fill=tk.X)
        
        ttk.Label(frame_dias, text="Días de la semana:", 
                 style="Subtitle.TLabel").pack(anchor=tk.W, pady=(0, 10))
        
        dias_frame = ttk.Frame(frame_dias)
        dias_frame.pack(anchor=tk.W)
        
        for i, (dia, var) in enumerate(self.dias_semana.items()):
            cb = ttk.Checkbutton(dias_frame, text=dia, variable=var)
            cb.pack(side=tk.LEFT, padx=(0, 15))
        
        # Botones de selección rápida
        botones_frame = ttk.Frame(frame_dias)
        botones_frame.pack(anchor=tk.W, pady=(10, 0))
        
        ttk.Button(botones_frame, text="Todos", command=self.seleccionar_todos_dias,
                  style="Secondary.TButton").pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(botones_frame, text="Lunes a Viernes", command=self.seleccionar_laborales,
                  style="Secondary.TButton").pack(side=tk.LEFT, padx=(0, 10))
        ttk.Button(botones_frame, text="Ninguno", command=self.deseleccionar_todos_dias,
                  style="Secondary.TButton").pack(side=tk.LEFT)
        
    def crear_seccion_nodos(self, parent):
        """Crea la sección de selección múltiple de nodos"""
        frame = ttk.LabelFrame(parent, text="🎯 Selección de Nodos", padding="20")
        frame.pack(fill=tk.X, pady=(0, 20))
        
        # Frame superior con información y controles
        info_frame = ttk.Frame(frame)
        info_frame.pack(fill=tk.X, pady=(0, 10))
        
        self.label_contador = ttk.Label(info_frame, text="Nodos encontrados: 0 | Seleccionados: 0", 
                                       style="Normal.TLabel")
        self.label_contador.pack(side=tk.LEFT)
        
        # Botones de control
        botones_control = ttk.Frame(info_frame)
        botones_control.pack(side=tk.RIGHT)
        
        ttk.Button(botones_control, text="✓ Seleccionar Todos", 
                  command=self.seleccionar_todos_nodos, style="Secondary.TButton").pack(side=tk.LEFT, padx=(0, 5))
        ttk.Button(botones_control, text="✗ Limpiar Selección", 
                  command=self.limpiar_seleccion_nodos, style="Secondary.TButton").pack(side=tk.LEFT)
        
        # Frame para la lista con scrollbar
        lista_frame = ttk.Frame(frame)
        lista_frame.pack(fill=tk.BOTH, expand=True)
        
        # Listbox con selección múltiple
        self.lista_nodos = tk.Listbox(lista_frame, selectmode=tk.MULTIPLE, 
                                     font=("Segoe UI", 9), height=8,
                                     bg='white', fg='#2c3e50',
                                     selectbackground='#3498db',
                                     selectforeground='white')
        self.lista_nodos.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        self.lista_nodos.bind('<<ListboxSelect>>', self.on_nodos_seleccionados)
        
        # Scrollbar para la lista
        scrollbar_nodos = ttk.Scrollbar(lista_frame, orient="vertical", 
                                       command=self.lista_nodos.yview)
        scrollbar_nodos.pack(side=tk.RIGHT, fill=tk.Y)
        self.lista_nodos.config(yscrollcommand=scrollbar_nodos.set)
        
    def crear_seccion_procesamiento(self, parent):
        """Crea la sección de procesamiento"""
        frame = ttk.Frame(parent)
        frame.pack(fill=tk.X, pady=(0, 20))
        
        # Botón principal centrado
        btn_procesar = ttk.Button(frame, text="🚀 Procesar Datos", 
                                 command=self.procesar_datos, style="Primary.TButton")
        btn_procesar.pack(pady=20)
        
    def crear_seccion_logs(self, parent):
        """Crea la sección de logs"""
        frame = ttk.LabelFrame(parent, text="📋 Registro de Operaciones", padding="20")
        frame.pack(fill=tk.BOTH, expand=True)
        
        # Frame para el área de texto con scrollbar
        text_frame = ttk.Frame(frame)
        text_frame.pack(fill=tk.BOTH, expand=True)
        
        self.log_text = tk.Text(text_frame, height=12, width=80, 
                               font=("Consolas", 9), bg='#2c3e50', fg='#ecf0f1',
                               insertbackground='white')
        self.log_text.pack(side=tk.LEFT, fill=tk.BOTH, expand=True)
        
        scrollbar_log = ttk.Scrollbar(text_frame, orient="vertical", 
                                     command=self.log_text.yview)
        scrollbar_log.pack(side=tk.RIGHT, fill=tk.Y)
        self.log_text.config(yscrollcommand=scrollbar_log.set)
        
        # Mostrar mensajes pendientes
        for mensaje in self.mensajes_pendientes:
            self.log_text.insert(tk.END, f"{mensaje}\n")
        self.mensajes_pendientes = []
        
    # ============ MÉTODOS DE CONTROL ============
    
    def seleccionar_carpeta(self):
        carpeta = filedialog.askdirectory(title="Seleccionar carpeta con archivos CSV")
        if carpeta:
            self.carpeta_seleccionada.set(carpeta)
            self.log(f"📁 Carpeta seleccionada: {carpeta}")
    
    def seleccionar_ruta_resultado(self):
        archivo = filedialog.asksaveasfilename(
            title="Guardar resultados como",
            defaultextension=".csv",
            filetypes=[("Archivos CSV", "*.csv"), ("Todos los archivos", "*.*")]
        )
        if archivo:
            self.ruta_resultados.set(archivo)
            self.log(f"💾 Archivo de resultados: {archivo}")
    
    def cargar_centros_control(self):
        """Carga los centros de control desde Supabase"""
        if self.supabase is None:
            self.log("⚠️ No hay conexión a Supabase")
            return
        
        try:
            response = self.supabase.table("NODO").select("CENTRO_DE_CONTROL_REGIONAL").execute()
            centros = list(set([item['CENTRO_DE_CONTROL_REGIONAL'] for item in response.data if item['CENTRO_DE_CONTROL_REGIONAL']]))
            centros.sort()
            
            self.combo_centro['values'] = centros
            self.log(f"🏢 Cargados {len(centros)} centros de control")
            
        except Exception as e:
            self.log(f"❌ Error al cargar centros: {e}")
    
    def on_centro_seleccionado(self, event=None):
        """Maneja la selección de centro de control"""
        centro = self.centro_seleccionado.get()
        if not centro:
            return
            
        # Limpiar zona y nodos
        self.zona_seleccionada.set("")
        self.combo_zona['values'] = []
        self.lista_nodos.delete(0, tk.END)
        self.nodos_disponibles = []
        self.actualizar_contador()
        
        # Cargar zonas del centro seleccionado
        self.cargar_zonas_por_centro(centro)
    
    def cargar_zonas_por_centro(self, centro):
        """Carga las zonas de carga de un centro específico"""
        if self.supabase is None:
            return
            
        try:
            response = self.supabase.table("NODO").select("ZONA_DE_CARGA").eq("CENTRO_DE_CONTROL_REGIONAL", centro).execute()
            zonas = list(set([item['ZONA_DE_CARGA'] for item in response.data if item['ZONA_DE_CARGA']]))
            zonas.sort()
            
            self.combo_zona['values'] = zonas
            self.log(f"🏭 Cargadas {len(zonas)} zonas para el centro: {centro}")
            
        except Exception as e:
            self.log(f"❌ Error al cargar zonas: {e}")
    
    def on_zona_seleccionada(self, event=None):
        """Maneja la selección de zona de carga"""
        # Limpiar lista de nodos cuando se cambia la zona
        self.lista_nodos.delete(0, tk.END)
        self.nodos_disponibles = []
        self.actualizar_contador()
    
    def buscar_nodos(self):
        """Busca nodos basándose en los filtros seleccionados"""
        centro = self.centro_seleccionado.get()
        zona = self.zona_seleccionada.get()
        
        if not centro:
            messagebox.showwarning("Selección incompleta", "Por favor, seleccione un centro de control.")
            return
        
        if not zona:
            messagebox.showwarning("Selección incompleta", "Por favor, seleccione una zona de carga.")
            return
        
        self.cargar_nodos_por_zona(centro, zona)
    
    def cargar_nodos_por_zona(self, centro, zona):
        """Carga los nodos de una zona específica"""
        if self.supabase is None:
            return
            
        try:
            response = self.supabase.table("NODO").select("CLAVE").eq("CENTRO_DE_CONTROL_REGIONAL", centro).eq("ZONA_DE_CARGA", zona).execute()
            
            self.nodos_disponibles = [item['CLAVE'] for item in response.data]
            self.nodos_disponibles.sort()
            
            # Actualizar lista
            self.lista_nodos.delete(0, tk.END)
            for nodo in self.nodos_disponibles:
                self.lista_nodos.insert(tk.END, nodo)
            
            self.actualizar_contador()
            self.log(f"🎯 Encontrados {len(self.nodos_disponibles)} nodos en {zona}")
            
        except Exception as e:
            self.log(f"❌ Error al cargar nodos: {e}")
    
    def on_nodos_seleccionados(self, event=None):
        """Maneja la selección múltiple de nodos"""
        self.actualizar_contador()
    
    def actualizar_contador(self):
        """Actualiza el contador de nodos"""
        total = len(self.nodos_disponibles)
        seleccionados = len(self.lista_nodos.curselection())
        self.label_contador.config(text=f"Nodos encontrados: {total} | Seleccionados: {seleccionados}")
    
    def seleccionar_todos_nodos(self):
        """Selecciona todos los nodos de la lista"""
        self.lista_nodos.select_set(0, tk.END)
        self.actualizar_contador()
    
    def limpiar_seleccion_nodos(self):
        """Limpia la selección de nodos"""
        self.lista_nodos.selection_clear(0, tk.END)
        self.actualizar_contador()
    
    def seleccionar_todos_dias(self):
        """Selecciona todos los días de la semana"""
        for var in self.dias_semana.values():
            var.set(True)
    
    def seleccionar_laborales(self):
        """Selecciona solo días laborales (Lunes a Viernes)"""
        dias_laborales = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes']
        for dia, var in self.dias_semana.items():
            var.set(dia in dias_laborales)
    
    def deseleccionar_todos_dias(self):
        """Deselecciona todos los días de la semana"""
        for var in self.dias_semana.values():
            var.set(False)
    
    def procesar_datos(self):
        """Procesa los datos con todos los filtros aplicados"""
        # Validaciones
        if not self.validar_entrada():
            return
        
        carpeta = self.carpeta_seleccionada.get()
        ruta_resultados = self.ruta_resultados.get()
        
        # Obtener nodos seleccionados
        indices_seleccionados = self.lista_nodos.curselection()
        nodos_seleccionados = [self.nodos_disponibles[i] for i in indices_seleccionados]
        
        # Obtener rango de fechas
        fecha_inicio = self.fecha_inicio.get_date()
        fecha_fin = self.fecha_fin.get_date()
        
        # Obtener días seleccionados
        dias_seleccionados = [dia for dia, var in self.dias_semana.items() if var.get()]
        
        self.log(f"🚀 ==================== INICIANDO PROCESAMIENTO ====================")
        self.log(f"📁 Carpeta: {carpeta}")
        self.log(f"📅 Período: {fecha_inicio.strftime('%d/%m/%Y')} - {fecha_fin.strftime('%d/%m/%Y')}")
        self.log(f"📆 Días seleccionados: {', '.join(dias_seleccionados)}")
        self.log(f"🎯 Nodos seleccionados ({len(nodos_seleccionados)}): {', '.join(nodos_seleccionados)}")
        
        try:
            archivos_csv = [f for f in os.listdir(carpeta) if f.endswith('.csv')]
            self.log(f"📄 Archivos CSV encontrados: {len(archivos_csv)}")
            if archivos_csv:
                self.log(f"📄 Lista de archivos: {', '.join(archivos_csv[:5])}{'...' if len(archivos_csv) > 5 else ''}")
            
            datos_filtrados = []
            archivos_procesados = 0
            archivos_validados = 0
            
            self.log(f"\n🔍 ==================== VALIDANDO ARCHIVOS ====================")
            
            for archivo in archivos_csv:
                ruta_completa = os.path.join(carpeta, archivo)
                self.log(f"\n--- Validando {archivo} ---")
                
                # Validar fecha del archivo
                if self.validar_fecha_archivo(ruta_completa, fecha_inicio, fecha_fin, dias_seleccionados):
                    archivos_validados += 1
                    self.log(f"✅ {archivo}: VALIDADO - Procesando datos...")
                    
                    # Procesar archivo para todos los nodos seleccionados
                    datos_archivo = self.procesar_archivo(ruta_completa, nodos_seleccionados)
                    if datos_archivo is not None and not datos_archivo.empty:
                        datos_filtrados.append(datos_archivo)
                        archivos_procesados += 1
                        self.log(f"✅ {archivo}: PROCESADO - {len(datos_archivo)} registros obtenidos")
                    else:
                        self.log(f"⚠️ {archivo}: Sin datos para los nodos seleccionados")
                else:
                    self.log(f"❌ {archivo}: NO cumple criterios de fecha/día")
            
            self.log(f"\n📊 ==================== RESUMEN ====================")
            self.log(f"📄 Total archivos CSV: {len(archivos_csv)}")
            self.log(f"✅ Archivos que pasaron filtros de fecha: {archivos_validados}")
            self.log(f"📊 Archivos con datos procesados: {archivos_procesados}")
            
            # Guardar resultados
            if datos_filtrados:
                df_resultado = pd.concat(datos_filtrados, ignore_index=True)
                df_resultado.to_csv(ruta_resultados, index=False, encoding='utf-8')
                
                self.log(f"\n🎉 ==================== ÉXITO ====================")
                self.log(f"✅ Procesamiento completado exitosamente!")
                self.log(f"📊 Registros totales en el resultado: {len(df_resultado)}")
                self.log(f"💾 Archivo guardado en: {ruta_resultados}")
                
                messagebox.showinfo("Éxito", 
                    f"Procesamiento completado exitosamente!\n\n"
                    f"Archivos procesados: {archivos_procesados}\n"
                    f"Registros totales: {len(df_resultado)}\n"
                    f"Archivo guardado en: {ruta_resultados}")
            else:
                self.log(f"\n⚠️ ==================== SIN RESULTADOS ====================")
                self.log(f"❌ No se encontraron datos que cumplan con TODOS los filtros:")
                self.log(f"   • Rango de fechas: {fecha_inicio.strftime('%d/%m/%Y')} - {fecha_fin.strftime('%d/%m/%Y')}")
                self.log(f"   • Días de semana: {', '.join(dias_seleccionados)}")
                self.log(f"   • Nodos: {', '.join(nodos_seleccionados)}")
                self.log(f"\n💡 Sugerencias:")
                self.log(f"   • Verificar que las fechas de los archivos están en el rango seleccionado")
                self.log(f"   • Verificar que los días de la semana están seleccionados correctamente")
                self.log(f"   • Verificar que los nodos existen en los archivos CSV")
                
                messagebox.showinfo("Sin resultados", 
                    f"No se encontraron datos que cumplan con los filtros aplicados.\n\n"
                    f"Revisa el log para más detalles sobre qué archivos se procesaron.")
        
        except Exception as e:
            self.log(f"❌ Error durante el procesamiento: {e}")
            messagebox.showerror("Error", f"Ocurrió un error durante el procesamiento:\n{e}")
    
    def validar_entrada(self):
        """Valida que todos los campos necesarios estén completos"""
        if not self.carpeta_seleccionada.get() or not os.path.isdir(self.carpeta_seleccionada.get()):
            messagebox.showerror("Error", "Por favor, seleccione una carpeta válida con archivos CSV.")
            return False
        
        if not self.ruta_resultados.get():
            messagebox.showerror("Error", "Por favor, especifique la ruta donde guardar los resultados.")
            return False
        
        # Verificar que hay nodos seleccionados
        if not self.lista_nodos.curselection():
            messagebox.showerror("Error", "Por favor, seleccione al menos un nodo de la lista.")
            return False
        
        # Verificar que hay días seleccionados
        dias_seleccionados = [dia for dia, var in self.dias_semana.items() if var.get()]
        if not dias_seleccionados:
            messagebox.showerror("Error", "Por favor, seleccione al menos un día de la semana.")
            return False
        
        # Verificar que la fecha de inicio no sea mayor que la fecha fin
        if self.fecha_inicio.get_date() > self.fecha_fin.get_date():
            messagebox.showerror("Error", "La fecha de inicio no puede ser mayor que la fecha fin.")
            return False
        
        return True
    
    def validar_fecha_archivo(self, ruta_archivo, fecha_inicio, fecha_fin, dias_seleccionados):
        """Valida si un archivo cumple con los criterios de fecha y día"""
        try:
            # Leer la fecha de la línea 5
            with open(ruta_archivo, 'r', encoding='utf-8') as f:
                lineas = f.readlines()
                if len(lineas) < 5:
                    self.log(f"⚠️ {os.path.basename(ruta_archivo)}: Archivo muy corto, menos de 5 líneas")
                    return False
                
                fecha_str = lineas[4].strip()
                self.log(f"🔍 {os.path.basename(ruta_archivo)}: Fecha raw = '{fecha_str}'")
                
                # Intentar parsear diferentes formatos de fecha
                fecha_archivo = self.parsear_fecha(fecha_str)
                if fecha_archivo is None:
                    self.log(f"❌ {os.path.basename(ruta_archivo)}: No se pudo parsear fecha '{fecha_str}'")
                    return False
                
                self.log(f"✓ {os.path.basename(ruta_archivo)}: Fecha parseada = {fecha_archivo.strftime('%d/%m/%Y')}")
                
                # Verificar si está en el rango de fechas
                if not (fecha_inicio <= fecha_archivo <= fecha_fin):
                    self.log(f"❌ {os.path.basename(ruta_archivo)}: Fecha fuera de rango. Archivo: {fecha_archivo.strftime('%d/%m/%Y')}, Rango: {fecha_inicio.strftime('%d/%m/%Y')} - {fecha_fin.strftime('%d/%m/%Y')}")
                    return False
                
                # Verificar día de la semana
                dia_semana = self.obtener_dia_semana(fecha_archivo)
                self.log(f"📅 {os.path.basename(ruta_archivo)}: Día de la semana = {dia_semana}")
                self.log(f"📅 Días seleccionados: {dias_seleccionados}")
                
                if dia_semana not in dias_seleccionados:
                    self.log(f"❌ {os.path.basename(ruta_archivo)}: Día '{dia_semana}' no está en los días seleccionados")
                    return False
                
                self.log(f"✅ {os.path.basename(ruta_archivo)}: Archivo VÁLIDO para procesamiento")
                return True
                
        except Exception as e:
            self.log(f"❌ Error al validar fecha del archivo {os.path.basename(ruta_archivo)}: {e}")
            return False
    
    def parsear_fecha(self, fecha_str):
        """Intenta parsear una fecha de diferentes formatos, incluyendo el formato CSV específico"""
        # Limpiar la cadena: quitar comillas dobles y espacios
        fecha_str = fecha_str.strip().strip('"').strip("'")
        
        # Extraer solo la parte de fecha si viene con "Fecha: "
        if fecha_str.startswith("Fecha: "):
            fecha_str = fecha_str.replace("Fecha: ", "").strip()
        
        # Mapeo de meses en español a números
        meses_esp = {
            'ene': '01', 'feb': '02', 'mar': '03', 'abr': '04',
            'may': '05', 'jun': '06', 'jul': '07', 'ago': '08',
            'sep': '09', 'oct': '10', 'nov': '11', 'dic': '12'
        }
        
        # Intentar formato específico del CSV: "01/feb/2025"
        try:
            partes = fecha_str.split('/')
            if len(partes) == 3:
                dia, mes_txt, año = partes
                if mes_txt.lower() in meses_esp:
                    mes_num = meses_esp[mes_txt.lower()]
                    fecha_normalizada = f"{dia}/{mes_num}/{año}"
                    return datetime.strptime(fecha_normalizada, '%d/%m/%Y').date()
        except:
            pass
        
        # Formatos alternativos
        formatos = [
            '%d/%m/%Y',
            '%d-%m-%Y',
            '%Y-%m-%d',
            '%d/%m/%Y %H:%M',
            '%d-%m-%Y %H:%M:%S',
            '%Y-%m-%d %H:%M:%S'
        ]
        
        for formato in formatos:
            try:
                return datetime.strptime(fecha_str, formato).date()
            except ValueError:
                continue
        
        return None
    
    def obtener_dia_semana(self, fecha):
        """Obtiene el día de la semana en español"""
        dias = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        return dias[fecha.weekday()]
    
    def procesar_archivo(self, ruta_archivo, nodos_seleccionados):
        """Procesa un archivo CSV individual para los nodos seleccionados"""
        try:
            self.log(f"\n🔍 DEBUG - Procesando archivo: {os.path.basename(ruta_archivo)}")
            
            # Leer la fecha de la línea 5 (índice 4)
            with open(ruta_archivo, 'r', encoding='utf-8') as f:
                lineas = f.readlines()
                self.log(f"📄 Total de líneas en archivo: {len(lineas)}")
                
                if len(lineas) >= 5:
                    fecha_str = lineas[4].strip()  # Línea 5 con "Fecha: 01/feb/2025"
                    self.log(f"📅 Línea 5 (fecha): '{fecha_str}'")
                    fecha_parseada = self.parsear_fecha(fecha_str)
                    if fecha_parseada:
                        fecha_formateada = fecha_parseada.strftime('%d/%m/%Y')
                        self.log(f"✅ Fecha parseada correctamente: {fecha_formateada}")
                    else:
                        fecha_formateada = fecha_str
                        self.log(f"❌ No se pudo parsear la fecha")
                else:
                    fecha_formateada = "Fecha desconocida"
                    self.log(f"❌ Archivo muy corto, no tiene línea 5")
            
            # Mostrar las primeras líneas para debug
            self.log(f"📄 Primeras 10 líneas del archivo:")
            with open(ruta_archivo, 'r', encoding='utf-8') as f:
                for i, linea in enumerate(f.readlines()[:10]):
                    self.log(f"   Línea {i+1}: '{linea.strip()}'")
            
            # Leer el archivo CSV saltando las primeras 7 filas (headers en fila 8)
            self.log(f"📊 Leyendo CSV saltando las primeras 7 filas...")
            df = pd.read_csv(
                ruta_archivo,
                encoding='utf-8',
                sep=',',
                engine='python',
                skiprows=7,  # Saltar hasta fila 7, leer headers en fila 8
                skipinitialspace=True
            )
            
            self.log(f"📊 DataFrame leído correctamente. Forma: {df.shape}")
            
            # Limpiar nombres de columnas eliminando espacios
            df.columns = [col.strip() for col in df.columns]
            self.log(f"📊 Columnas disponibles: {list(df.columns)}")
            
            # Verificar que existe la columna 'Clave del nodo'
            if 'Clave del nodo' not in df.columns:
                self.log(f"❌ PROBLEMA: No se encontró la columna 'Clave del nodo'")
                self.log(f"📊 Columnas exactas: {df.columns.tolist()}")
                
                # Buscar columnas similares
                columnas_similares = [col for col in df.columns if 'clave' in col.lower() or 'nodo' in col.lower()]
                if columnas_similares:
                    self.log(f"🔍 Columnas similares encontradas: {columnas_similares}")
                
                return None
            
            self.log(f"✅ Columna 'Clave del nodo' encontrada correctamente")
            
            # Mostrar valores únicos en la columna 'Clave del nodo'
            valores_unicos = df['Clave del nodo'].unique()
            self.log(f"🎯 Valores únicos en 'Clave del nodo' ({len(valores_unicos)}): {valores_unicos[:10].tolist()}{'...' if len(valores_unicos) > 10 else ''}")
            
            # Mostrar nodos que estamos buscando
            self.log(f"🔍 Nodos que estamos buscando: {nodos_seleccionados}")
            
            # Verificar coincidencias exactas
            coincidencias = []
            for nodo in nodos_seleccionados:
                if nodo in valores_unicos:
                    coincidencias.append(nodo)
                    self.log(f"✅ ENCONTRADO: '{nodo}'")
                else:
                    self.log(f"❌ NO ENCONTRADO: '{nodo}'")
                    # Buscar coincidencias parciales
                    parciales = [v for v in valores_unicos if str(nodo).strip() in str(v).strip()]
                    if parciales:
                        self.log(f"   🔍 Coincidencias parciales: {parciales}")
            
            # Filtrar por los nodos seleccionados
            self.log(f"🔍 Filtrando DataFrame por nodos: {nodos_seleccionados}")
            df_filtrado = df[df['Clave del nodo'].isin(nodos_seleccionados)]
            self.log(f"📊 Registros después del filtrado: {len(df_filtrado)}")
            
            if not df_filtrado.empty:
                # Crear una copia para evitar warnings
                df_filtrado = df_filtrado.copy()
                
                # Agregar la fecha formateada como primera columna
                df_filtrado.insert(0, 'Fecha', fecha_formateada)
                
                self.log(f"✅ {os.path.basename(ruta_archivo)}: ÉXITO - {len(df_filtrado)} registros obtenidos")
                self.log(f"📊 Muestra de datos filtrados:")
                self.log(f"   Columnas: {df_filtrado.columns.tolist()}")
                if len(df_filtrado) > 0:
                    primer_registro = df_filtrado.iloc[0].to_dict()
                    self.log(f"   Primer registro: {primer_registro}")
                
                return df_filtrado
            else:
                self.log(f"❌ {os.path.basename(ruta_archivo)}: DataFrame filtrado está VACÍO")
                return None
            
        except Exception as e:
            self.log(f"❌ ERROR CRÍTICO al procesar {os.path.basename(ruta_archivo)}: {e}")
            import traceback
            self.log(f"📄 Traceback completo:\n{traceback.format_exc()}")
            return None
    
    def log(self, mensaje):
        """Añade un mensaje al área de logs con timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        
        if self.log_text is None:
            print(f"[{timestamp}] {mensaje}")
            self.mensajes_pendientes.append(f"[{timestamp}] {mensaje}")
        else:
            if hasattr(self, 'mensajes_pendientes') and self.mensajes_pendientes:
                for msg_pendiente in self.mensajes_pendientes:
                    self.log_text.insert(tk.END, f"{msg_pendiente}\n")
                self.mensajes_pendientes = []
            
            self.log_text.insert(tk.END, f"[{timestamp}] {mensaje}\n")
            self.log_text.see(tk.END)
            self.log_text.update()

if __name__ == "__main__":
    root = tk.Tk()
    app = AplicacionFiltrado(root)
    root.mainloop()