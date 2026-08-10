import { BarChart2, BookOpen, Brain, FileText, Globe, Layers, LogOut, MessageCircle, Moon, Settings, Sun, Trophy, Zap } from 'lucide-react'

const tabs = [
  { id: 'dashboard', label: 'Genel Bakış', icon: BarChart2 }, { id: 'languages', label: 'Dillerim', icon: Globe },
  { id: 'vocabulary', label: 'Günlük Set', icon: Brain }, { id: 'flashcards', label: 'Tekrar Kartları', icon: Layers },
  { id: 'practice', label: 'Pratik', icon: Zap }, { id: 'chat', label: 'Sesli Koç', icon: MessageCircle },
  { id: 'documents', label: 'PDF Stüdyosu', icon: FileText }, { id: 'achievements', label: 'Başarılar', icon: Trophy },
]

export default function Navbar({ activeTab, setActiveTab, user, theme, setTheme, onSignOut }) {
  return <aside className="sidebar">
    <div className="brand"><div className="brand-mark"><BookOpen size={19} /></div><div><strong>Polyglot</strong><span>learning studio</span></div></div>
    <nav className="side-nav"><span className="nav-caption">ÖĞRENME</span>{tabs.map(tab => { const Icon = tab.icon; return <button key={tab.id} className={activeTab === tab.id ? 'active' : ''} onClick={() => setActiveTab(tab.id)}><Icon size={18} strokeWidth={1.7} /><span>{tab.label}</span></button> })}</nav>
    <div className="sidebar-footer">
      <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}><Settings size={18} strokeWidth={1.7} /><span>Öğrenme Ayarları</span></button>
      <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}<span>{theme === 'dark' ? 'Aydınlık görünüm' : 'Karanlık görünüm'}</span></button>
      <div className="sidebar-user"><div className="user-avatar">{user.name?.[0]?.toUpperCase()}</div><div><strong>{user.name}</strong><span>Seviye {user.level} · {user.totalXP.toLocaleString()} XP</span></div><button onClick={onSignOut} aria-label="Çıkış yap"><LogOut size={16} /></button></div>
    </div>
  </aside>
}
