using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Linq;
using System.Runtime.InteropServices;
using System.Text;
using System.Windows.Forms;

// Standalone focus switcher: never sends game keys, mouse events or network traffic.
public class EscouadeOrganizer : Form {
    delegate bool EnumProc(IntPtr window,IntPtr param);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc proc,IntPtr param);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr window);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr window,out uint pid);
    [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr window,StringBuilder text,int max);
    [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr window);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern bool IsIconic(IntPtr window);
    [DllImport("user32.dll")] static extern bool ShowWindow(IntPtr window,int command);
    [DllImport("user32.dll")] static extern bool RegisterHotKey(IntPtr window,int id,uint modifiers,uint key);
    [DllImport("user32.dll")] static extern bool UnregisterHotKey(IntPtr window,int id);
    class Entry {public IntPtr Handle; public string Name; public int Initiative;}
    readonly List<Entry> entries=new List<Entry>();
    readonly DataGridView grid=new DataGridView();
    readonly Label status=new Label();
    readonly ComboBox previous=new ComboBox(),next=new ComboBox();
    readonly Button toggle=new Button();
    bool enabled=false; int last=-1;
    [STAThread] public static void Main(){Application.EnableVisualStyles();Application.Run(new EscouadeOrganizer());}
    public EscouadeOrganizer(){
        Text="Escouade — Organisateur Dofus";ClientSize=new Size(850,540);MinimumSize=new Size(700,450);
        BackColor=Color.FromArgb(16,23,38);ForeColor=Color.White;Font=new Font("Segoe UI",10);
        var layout=new TableLayoutPanel{Dock=DockStyle.Fill,RowCount=4,ColumnCount=1,Padding=new Padding(18)};
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute,65));layout.RowStyles.Add(new RowStyle(SizeType.Percent,100));layout.RowStyles.Add(new RowStyle(SizeType.Absolute,90));layout.RowStyles.Add(new RowStyle(SizeType.Absolute,45));Controls.Add(layout);
        layout.Controls.Add(new Label{Text="Organise tes fenêtres Dofus. Les raccourcis changent uniquement la fenêtre active.\nActualise après l’ouverture ou la fermeture d’un client.",Dock=DockStyle.Fill,AutoSize=false});
        grid.Dock=DockStyle.Fill;grid.AllowUserToAddRows=false;grid.AllowUserToDeleteRows=false;grid.RowHeadersVisible=false;grid.SelectionMode=DataGridViewSelectionMode.FullRowSelect;grid.MultiSelect=false;
        grid.BackgroundColor=BackColor;grid.DefaultCellStyle.BackColor=Color.FromArgb(30,40,58);grid.DefaultCellStyle.ForeColor=Color.White;grid.DefaultCellStyle.SelectionBackColor=Color.FromArgb(57,78,114);grid.AutoSizeColumnsMode=DataGridViewAutoSizeColumnsMode.Fill;
        grid.Columns.Add("order","Ordre");grid.Columns.Add("name","Fenêtre Dofus");grid.Columns.Add("initiative","Initiative (saisie manuelle)");grid.Columns[0].ReadOnly=true;grid.Columns[1].ReadOnly=true;
        grid.CellEndEdit+=(s,e)=>{if(e.RowIndex>=0&&e.RowIndex<entries.Count){int val;if(int.TryParse(Convert.ToString(grid.Rows[e.RowIndex].Cells[2].Value),out val)&&val>=0)entries[e.RowIndex].Initiative=val;else grid.Rows[e.RowIndex].Cells[2].Value=entries[e.RowIndex].Initiative;}};
        layout.Controls.Add(grid);
        var controls=new FlowLayoutPanel{Dock=DockStyle.Fill,AutoSize=false,WrapContents=true};layout.Controls.Add(controls);
        AddButton(controls,"Actualiser",RefreshWindows);AddButton(controls,"↑ Monter",()=>MoveEntry(-1));AddButton(controls,"↓ Descendre",()=>MoveEntry(1));AddButton(controls,"Trier par initiative",()=>{grid.EndEdit();entries.Sort((a,b)=>b.Initiative.CompareTo(a.Initiative));PaintRows();});
        AddButton(controls,"Précédente",()=>FocusStep(-1));AddButton(controls,"Suivante",()=>FocusStep(1));
        controls.Controls.Add(new Label{Text="Précédente",AutoSize=true,Margin=new Padding(6,10,2,0)});
        foreach(var cb in new[]{previous,next}){cb.DropDownStyle=ComboBoxStyle.DropDownList;cb.Width=70;for(int i=1;i<=12;i++)cb.Items.Add("F"+i);}
        previous.SelectedIndex=5;next.SelectedIndex=6;controls.Controls.Add(previous);controls.Controls.Add(new Label{Text="Suivante",AutoSize=true,Margin=new Padding(6,10,2,0)});controls.Controls.Add(next);
        toggle.Text="Activer les raccourcis";toggle.AutoSize=true;toggle.Click+=(s,e)=>ToggleKeys();controls.Controls.Add(toggle);
        status.Dock=DockStyle.Fill;status.Text="Raccourcis désactivés. Fermer cette fenêtre les libère toujours.";layout.Controls.Add(status);
        FormClosed+=(s,e)=>ReleaseKeys();Shown+=(s,e)=>RefreshWindows();
    }
    void AddButton(Control parent,string label,Action action){var b=new Button{Text=label,AutoSize=true,FlatStyle=FlatStyle.Flat};b.Click+=(s,e)=>action();parent.Controls.Add(b);}
    void PaintRows(){grid.Rows.Clear();for(int i=0;i<entries.Count;i++)grid.Rows.Add(i+1,entries[i].Name,entries[i].Initiative);}
    void RefreshWindows(){
        var old=entries.ToDictionary(x=>x.Handle,x=>x);var found=new List<Entry>();
        EnumWindows((w,p)=>{if(!IsWindowVisible(w))return true;uint pid;GetWindowThreadProcessId(w,out pid);try{using(var process=Process.GetProcessById((int)pid)){if(!String.Equals(process.ProcessName,"Dofus",StringComparison.OrdinalIgnoreCase))return true;var text=new StringBuilder(1024);GetWindowText(w,text,text.Capacity);if(text.Length==0)return true;Entry row;if(!old.TryGetValue(w,out row))row=new Entry{Handle=w,Name=text.ToString(),Initiative=0};row.Name=text.ToString();found.Add(row);}}catch(ArgumentException){}catch(System.ComponentModel.Win32Exception){}return true;},IntPtr.Zero);
        var ordered=entries.Where(x=>found.Any(f=>f.Handle==x.Handle)).ToList();ordered.AddRange(found.Where(x=>!ordered.Any(o=>o.Handle==x.Handle)));entries.Clear();entries.AddRange(ordered);PaintRows();last=-1;status.Text=entries.Count+" fenêtre(s) Dofus détectée(s). "+(enabled?"Raccourcis actifs.":"Raccourcis désactivés.");
    }
    void MoveEntry(int d){if(grid.CurrentRow==null)return;int i=grid.CurrentRow.Index,j=i+d;if(j<0||j>=entries.Count)return;grid.EndEdit();var row=entries[i];entries.RemoveAt(i);entries.Insert(j,row);PaintRows();grid.Rows[j].Selected=true;grid.CurrentCell=grid.Rows[j].Cells[0];}
    void FocusStep(int d){if(entries.Count==0){status.Text="Aucune fenêtre Dofus. Clique sur Actualiser après avoir lancé le jeu.";return;}var active=GetForegroundWindow();int i=entries.FindIndex(x=>x.Handle==active);if(i<0)i=last;int j=(i+d+entries.Count)%entries.Count;var window=entries[j].Handle;if(IsIconic(window))ShowWindow(window,9);if(SetForegroundWindow(window)){last=j;status.Text="Fenêtre active : "+entries[j].Name;}else status.Text="Windows a refusé le changement de fenêtre. Actualise la liste et réessaie.";}
    void ToggleKeys(){if(enabled){ReleaseKeys();status.Text="Raccourcis désactivés.";return;}if(previous.SelectedIndex==next.SelectedIndex){status.Text="Choisis deux touches différentes.";return;}bool a=RegisterHotKey(Handle,1,0x4000,(uint)(0x70+previous.SelectedIndex));bool b=RegisterHotKey(Handle,2,0x4000,(uint)(0x70+next.SelectedIndex));if(!a||!b){ReleaseKeys();status.Text="Une touche est déjà utilisée. Choisis d’autres raccourcis.";return;}enabled=true;toggle.Text="Désactiver les raccourcis";previous.Enabled=next.Enabled=false;status.Text="Raccourcis actifs : "+previous.Text+" / "+next.Text+". Ferme cet outil pour les libérer.";}
    void ReleaseKeys(){UnregisterHotKey(Handle,1);UnregisterHotKey(Handle,2);enabled=false;toggle.Text="Activer les raccourcis";previous.Enabled=next.Enabled=true;}
    protected override void WndProc(ref Message m){if(m.Msg==0x0312){FocusStep(m.WParam.ToInt32()==1?-1:1);return;}base.WndProc(ref m);}
}
