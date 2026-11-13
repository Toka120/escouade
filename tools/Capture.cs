using System;
using System.Diagnostics;
using System.Drawing;
using System.Drawing.Imaging;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using System.Text.RegularExpressions;
using System.Windows.Forms;

class CaptureEscouade : Form {
    delegate bool EnumProc(IntPtr h,IntPtr p);
    [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb,IntPtr p);
    [DllImport("user32.dll")] static extern bool IsWindowVisible(IntPtr h);
    [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
    [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr h,StringBuilder s,int n);
    [DllImport("user32.dll")] static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll")] static extern bool SetForegroundWindow(IntPtr h);
    [DllImport("user32.dll")] static extern bool GetClientRect(IntPtr h,out RECT r);
    [DllImport("user32.dll")] static extern bool ClientToScreen(IntPtr h,ref POINT p);
    [DllImport("user32.dll")] static extern bool SetProcessDPIAware();
    [StructLayout(LayoutKind.Sequential)] struct RECT { public int Left,Top,Right,Bottom; }
    [StructLayout(LayoutKind.Sequential)] struct POINT { public int X,Y; }
    class Entry {public IntPtr Handle;public uint Pid;public string Title;public override string ToString(){return Title;}}
    ComboBox windows=new ComboBox{DropDownStyle=ComboBoxStyle.DropDownList,Dock=DockStyle.Top};
    Label status=new Label{Dock=DockStyle.Fill,Text="Sélectionne la fenêtre et ouvre le panneau à relever dans Dofus.",Padding=new Padding(5)};
    Button capture=new Button{Text="Capturer la fenêtre sélectionnée",AutoSize=true};
    bool busy;
    readonly string request;
    [STAThread] static void Main(string[] args){
        string request=null;
        if(args.Length>0){if(args.Length!=2||args[0]!="--request"||!Regex.IsMatch(args[1],"^[a-f0-9]{32}$")){Environment.ExitCode=3;return;}request=args[1];Environment.ExitCode=2;}
        SetProcessDPIAware();Application.EnableVisualStyles();Application.Run(new CaptureEscouade(request));
    }
    CaptureEscouade(string request){
        this.request=request;
        Text="Capture Escouade — locale";Width=660;Height=310;MinimumSize=new Size(550,300);StartPosition=FormStartPosition.CenterScreen;
        var layout=new TableLayoutPanel{Dock=DockStyle.Fill,Padding=new Padding(15),ColumnCount=1,RowCount=4};
        layout.RowStyles.Add(new RowStyle(SizeType.Absolute,65));layout.RowStyles.Add(new RowStyle(SizeType.Absolute,40));layout.RowStyles.Add(new RowStyle(SizeType.Absolute,50));layout.RowStyles.Add(new RowStyle(SizeType.Percent,100));Controls.Add(layout);
        layout.Controls.Add(new Label{Dock=DockStyle.Fill,Text="Capture volontaire du contenu visible d’une fenêtre Dofus.\nAucune touche de jeu, lecture mémoire ou surveillance. Les PNG sont personnels : ne les publie pas avec les sources."});layout.Controls.Add(windows);
        var buttons=new FlowLayoutPanel{Dock=DockStyle.Fill};var refresh=new Button{Text="Actualiser",AutoSize=true};refresh.Click+=(s,e)=>RefreshWindows();buttons.Controls.Add(refresh);buttons.Controls.Add(capture);layout.Controls.Add(buttons);layout.Controls.Add(status);
        capture.Click+=async(s,e)=>await CaptureSelected();Shown+=(s,e)=>RefreshWindows();
    }
    bool IsDofus(Entry entry){uint pid;GetWindowThreadProcessId(entry.Handle,out pid);if(pid!=entry.Pid)return false;try{using(var p=Process.GetProcessById((int)pid))return String.Equals(p.ProcessName,"Dofus",StringComparison.OrdinalIgnoreCase);}catch{return false;}}
    void RefreshWindows(){if(busy)return;windows.Items.Clear();EnumWindows((h,p)=>{if(!IsWindowVisible(h))return true;uint pid;GetWindowThreadProcessId(h,out pid);var row=new Entry{Handle=h,Pid=pid};if(!IsDofus(row))return true;var title=new StringBuilder(1024);GetWindowText(h,title,title.Capacity);if(title.Length>0){row.Title=title.ToString();windows.Items.Add(row);}return true;},IntPtr.Zero);if(windows.Items.Count>0)windows.SelectedIndex=0;status.Text=windows.Items.Count+" fenêtre(s) Dofus. Choisis explicitement le personnage à capturer.";}
    async Task CaptureSelected(){
        var row=windows.SelectedItem as Entry;if(busy)return;if(row==null){status.Text="Aucune fenêtre sélectionnée. Ouvre Dofus puis Actualiser.";return;}busy=true;capture.Enabled=false;bool completed=false;
        try{
            if(!IsDofus(row))throw new Exception("Fenêtre fermée ou remplacée. Actualise la liste.");
            SetForegroundWindow(row.Handle);
            await Task.Delay(800);
            if(GetForegroundWindow()!=row.Handle||!IsDofus(row))throw new Exception("La fenêtre active a changé : capture annulée.");
            RECT rect;POINT origin=new POINT();if(!GetClientRect(row.Handle,out rect)||!ClientToScreen(row.Handle,ref origin))throw new Exception("Dimensions indisponibles.");
            int width=rect.Right-rect.Left,height=rect.Bottom-rect.Top;var area=new Rectangle(origin.X,origin.Y,width,height);
            if(width<50||height<50||(long)width*height>24000000||!SystemInformation.VirtualScreen.Contains(area))throw new Exception("La fenêtre doit être entièrement visible à l’écran (24 millions de pixels maximum).");
            using(var image=new Bitmap(width,height)){using(var graphics=Graphics.FromImage(image))graphics.CopyFromScreen(origin.X,origin.Y,0,0,new Size(width,height),CopyPixelOperation.SourceCopy);
                if(GetForegroundWindow()!=row.Handle)throw new Exception("La fenêtre active a changé : capture annulée.");
                var folder=Path.Combine(AppDomain.CurrentDomain.BaseDirectory,"Captures de scan");Directory.CreateDirectory(folder);var file=Path.Combine(folder,request==null?"capture-"+DateTime.Now.ToString("yyyyMMdd-HHmmss-fff")+".png":"capture-request-"+request+".png");image.Save(file,ImageFormat.Png);
                if(request==null){try{Clipboard.SetImage(image);status.Text="PNG enregistré : "+file+"\nReviens dans Escouade > Scan et import puis Ctrl+V (hors champ texte).";}catch{status.Text="PNG enregistré : "+file+"\nImporte ce fichier dans Escouade > Scan et import.";}}
                completed=true;Environment.ExitCode=0;
            }
        }catch(Exception ex){status.Text=ex.Message;}
        finally{busy=false;capture.Enabled=true;if(completed&&request!=null)Close();else Activate();}
    }
}
