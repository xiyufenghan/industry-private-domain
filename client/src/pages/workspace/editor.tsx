import { useState } from 'react'
import { Bold, Italic, AlignLeft, AlignCenter, AlignRight, Type, Image, Minus, Copy, Smartphone, Save } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'

const presetStyles = [
  { name: '标题一', html: '<h1 style="color:#0052D9;font-size:22px;font-weight:bold;margin:16px 0 8px;border-left:4px solid #0052D9;padding-left:12px;">标题文字</h1>' },
  { name: '标题二', html: '<h2 style="color:#1F2937;font-size:18px;font-weight:bold;margin:12px 0 8px;background:linear-gradient(to right,#EBF5FF,transparent);padding:8px 12px;border-radius:4px;">标题文字</h2>' },
  { name: '引用框', html: '<blockquote style="border-left:3px solid #0052D9;background:#F8FAFF;padding:12px 16px;margin:12px 0;border-radius:0 8px 8px 0;color:#4B5563;font-size:14px;">引用内容</blockquote>' },
  { name: '高亮卡片', html: '<div style="background:linear-gradient(135deg,#EBF5FF,#F0F7FF);border-radius:12px;padding:16px 20px;margin:12px 0;border:1px solid #DBEAFE;"><p style="color:#1E40AF;font-size:14px;line-height:1.8;">卡片内容</p></div>' },
  { name: '分割线', html: '<hr style="border:none;height:1px;background:linear-gradient(to right,transparent,#D1D5DB,transparent);margin:20px 0;" />' },
]

export default function EditorPage() {
  const [content, setContent] = useState('<h1 style="color:#0052D9;font-size:22px;font-weight:bold;border-left:4px solid #0052D9;padding-left:12px;">公众号文章标题</h1>\n<p style="color:#4B5563;font-size:15px;line-height:2;">在这里开始编写您的公众号文章内容。支持富文本编辑和样式预设，编辑完成后可一键复制HTML到公众号后台。</p>')
  const [showPreview, setShowPreview] = useState(false)
  const [showTemplates, setShowTemplates] = useState(true)
  const [copied, setCopied] = useState(false)

  const insertTemplate = (html: string) => {
    setContent(content + '\n' + html)
  }

  const copyHtml = () => {
    navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">公众号排版编辑器</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
            <Smartphone className="w-4 h-4 mr-1.5" />手机预览
          </Button>
          <Button variant="outline" size="sm" onClick={copyHtml}>
            <Copy className="w-4 h-4 mr-1.5" />{copied ? '已复制!' : '复制 HTML'}
          </Button>
          <Button size="sm"><Save className="w-4 h-4 mr-1.5" />保存草稿</Button>
        </div>
      </div>

      {/* Toolbar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-2 flex items-center gap-1 flex-wrap">
          {[Bold, Italic].map((Icon, i) => (
            <button key={i} className="p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"><Icon className="w-4 h-4 text-gray-600" /></button>
          ))}
          <div className="w-px h-6 bg-gray-200 mx-1" />
          {[AlignLeft, AlignCenter, AlignRight].map((Icon, i) => (
            <button key={i} className="p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"><Icon className="w-4 h-4 text-gray-600" /></button>
          ))}
          <div className="w-px h-6 bg-gray-200 mx-1" />
          <button className="p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"><Type className="w-4 h-4 text-gray-600" /></button>
          <button className="p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"><Image className="w-4 h-4 text-gray-600" /></button>
          <button className="p-2 rounded hover:bg-gray-100 cursor-pointer transition-colors"><Minus className="w-4 h-4 text-gray-600" /></button>
          <div className="flex-1" />
          <button onClick={() => setShowTemplates(!showTemplates)} className={`px-3 py-1.5 rounded text-sm cursor-pointer transition-colors ${showTemplates ? 'bg-primary/10 text-primary' : 'text-gray-600 hover:bg-gray-100'}`}>
            模板
          </button>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        {/* Editor area */}
        <div className="flex-1">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="mx-auto max-w-[375px] min-h-[600px] bg-white p-5">
                <textarea
                  className="w-full min-h-[580px] text-sm leading-relaxed resize-none border-0 outline-none bg-transparent font-mono"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="开始编写HTML内容..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Template panel */}
        {showTemplates && (
          <div className="w-64 shrink-0 animate-fade-in">
            <Card className="border-0 shadow-sm sticky top-20">
              <CardContent className="p-4">
                <h3 className="font-medium text-sm text-gray-800 mb-3">样式模板</h3>
                <div className="space-y-2">
                  {presetStyles.map((style) => (
                    <button
                      key={style.name}
                      onClick={() => insertTemplate(style.html)}
                      className="w-full text-left px-3 py-2.5 rounded-lg bg-gray-50 hover:bg-primary/5 hover:text-primary text-sm transition-colors cursor-pointer"
                    >
                      {style.name}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="w-[375px] shrink-0 animate-fade-in">
            <div className="bg-gray-800 rounded-[2rem] p-3 shadow-xl sticky top-20">
              <div className="bg-white rounded-[1.5rem] overflow-hidden">
                <div className="h-6 bg-gray-100 flex items-center justify-center"><div className="w-20 h-1 bg-gray-300 rounded-full" /></div>
                <div className="p-4 min-h-[500px] overflow-y-auto" dangerouslySetInnerHTML={{ __html: content }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
