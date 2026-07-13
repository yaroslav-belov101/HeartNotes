import { useEffect, useState } from 'react'
import { events } from '../data'
import type { Note } from '../types'

const DAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']
const MONTHS = [
  'Январь','Февраль','Март','Апрель','Май','Июнь',
  'Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',
]

const personColors: Record<number, string> = {
  1: '#FF6B9D',
  2: '#A78BFA',
  3: '#34D399',
  4: '#60A5FA',
  5: '#FCD34D',
}

function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfWeek(year: number, month: number) {
  // Monday = 0
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

interface Props {
  onViewNote?: (note: Note) => void
}

export default function Calendar({ onViewNote: _onViewNote }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())
  const [selectedDay, setSelectedDay] = useState<number | null>(today.getDate())
  const [eventList, setEventList] = useState(events)
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventEmoji, setNewEventEmoji] = useState('📅')
  const [newEventNote, setNewEventNote] = useState('')
  type Anniversary = { id: string; name: string; date: string; emoji?: string; personId?: number; personName?: string }
  const [anniversaries, setAnniversaries] = useState<Anniversary[]>(() => {
    try {
      const raw = localStorage.getItem('heartnotes-anniversaries')
      return raw ? JSON.parse(raw) : []
    } catch (e) {
      return []
    }
  })
  const [newAnnName, setNewAnnName] = useState('')
  const [newAnnEmoji, setNewAnnEmoji] = useState('🎉')
  const [newAnnDate, setNewAnnDate] = useState<string | null>(null)
  const [newAnnNote, setNewAnnNote] = useState('')

  // when selectedDay changes, prefill date for anniversary picker
  useEffect(() => {
    if (selectedDay) {
      const ds = `${year.toString().padStart(4,'0')}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}`
      setNewAnnDate(ds)
    } else {
      setNewAnnDate(null)
    }
  }, [selectedDay, month, year])

  const daysInMonth = getDaysInMonth(year, month)
  const firstDow = getFirstDayOfWeek(year, month)

  // Map day → events (including anniversaries occurrences for the viewed month)
  const eventsByDay: Record<number, Array<any>> = {}
  // include one-off events
  eventList.forEach(ev => {
    if (ev.date.getFullYear() === year && ev.date.getMonth() === month) {
      const d = ev.date.getDate()
      if (!eventsByDay[d]) eventsByDay[d] = []
      eventsByDay[d].push(ev)
    }
  })
  // include anniversaries mapped to this viewing year/month
  anniversaries.forEach((a: Anniversary) => {
    try {
      const [, am, ad] = a.date.split('-').map((n: string) => Number(n))
      const occ = new Date(year, am - 1, ad)
      if (occ.getFullYear() === year && occ.getMonth() === month) {
        const d = occ.getDate()
        if (!eventsByDay[d]) eventsByDay[d] = []
        eventsByDay[d].push({
          id: a.id,
          date: occ,
          title: a.name,
          personId: a.personId ?? 0,
          personName: a.personName ?? a.name,
          emoji: a.emoji || '🎉',
          isAnniversary: true,
        })
      }
    } catch (e) { /* ignore malformed */ }
  })

  const selectedEvents = selectedDay ? (eventsByDay[selectedDay] ?? []) : []

  const addEvent = () => {
    if (!selectedDay || !newEventTitle.trim()) return

    const newEvent = {
      id: `evt-${Date.now()}`,
      date: new Date(year, month, selectedDay),
      title: newEventTitle.trim(),
      personId: 1,
      note: newEventNote.trim() || '',
      emoji: newEventEmoji || '📅',
    }

    setEventList(prev => [...prev, newEvent])
    setNewEventTitle('')
    setNewEventNote('')
  }

  const addAnniversary = () => {
    const dateStr = newAnnDate || (selectedDay ? `${year.toString().padStart(4,'0')}-${String(month+1).padStart(2,'0')}-${String(selectedDay).padStart(2,'0')}` : null)
    if (!dateStr || !newAnnName.trim()) return
    const id = `ann-${Date.now()}`
    const ann = { id, name: newAnnName.trim(), date: dateStr, emoji: newAnnEmoji, note: newAnnNote?.trim() }
    setAnniversaries((prev: Anniversary[]) => [...prev, ann])
    setNewAnnName('')
    setNewAnnEmoji('🎉')
    setNewAnnNote('')
  }

  const deleteAnniversary = (id: string) => {
    setAnniversaries((prev: Anniversary[]) => prev.filter((a: Anniversary) => a.id !== id))
  }

  const deleteEvent = (eventId: string) => {
    setEventList(prev => prev.filter(ev => ev.id !== eventId))
  }

  useEffect(() => {
    try {
      localStorage.setItem('heartnotes-anniversaries', JSON.stringify(anniversaries))
    } catch (e) { /* ignore */ }
  }, [anniversaries])

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(y => y - 1) }
    else setMonth(m => m - 1)
    setSelectedDay(null)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(y => y + 1) }
    else setMonth(m => m + 1)
    setSelectedDay(null)
  }

  // Build calendar grid cells (null = empty)
  const cells: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]
  // Pad to full weeks
  while (cells.length % 7 !== 0) cells.push(null)

  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() && year === today.getFullYear()

  // All upcoming events (all months) sorted
  // include upcoming one-off events
  const upcomingEvents = eventList.map(ev => ({ ...ev }))
  // include next occurrence for anniversaries
  const upcomingAnns = anniversaries.map((a: Anniversary) => {
    const [, am, ad] = a.date.split('-').map((n: string) => Number(n))
    let occ = new Date(today.getFullYear(), am - 1, ad)
    if (occ < today) occ = new Date(today.getFullYear() + 1, am - 1, ad)
    return {
      id: a.id,
      date: occ,
      title: a.name,
      personId: a.personId ?? 0,
      personName: a.personName ?? a.name,
      emoji: a.emoji || '🎉',
      isAnniversary: true,
    }
  })

  const upcoming = [...upcomingEvents, ...upcomingAnns]
    .filter(ev => ev.date >= today)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .slice(0, 5)

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '12px 20px', flexShrink: 0,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(20px)',
      }}>
        <h1 className="font-playfair gradient-text" style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>
          Календарь
        </h1>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px' }}>
        {/* Top anniversary form removed — only bottom form remains */}
          <div className="glass" style={{
            borderRadius: 20, padding: '16px', marginBottom: 14,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <button onClick={prevMonth} style={{
                background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
                width: 36, height: 36, borderRadius: 10, color: '#A0A0C0', fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>‹</button>

              <div style={{ textAlign: 'center' }}>
                <div className="font-playfair gradient-text" style={{ fontSize: '1.15rem', fontWeight: 700, lineHeight: 1 }}>
                  {MONTHS[month]}
                </div>
                <div className="font-inter" style={{ fontSize: '0.72rem', color: '#6B6B8D', marginTop: 2 }}>
                  {year}
                </div>
              </div>

              <button onClick={nextMonth} style={{
                background: 'rgba(255,255,255,0.06)', border: 'none', cursor: 'pointer',
                width: 36, height: 36, borderRadius: 10, color: '#A0A0C0', fontSize: '1rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>›</button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2, marginBottom: 6 }}>
              {DAYS.map(d => (
                <div key={d} className="font-inter" style={{
                  textAlign: 'center', fontSize: '0.65rem', color: '#6B6B8D', fontWeight: 600,
                  padding: '4px 0',
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 2 }}>
              {cells.map((day, idx) => {
                if (day === null) return <div key={`empty-${idx}`} />

                const hasEvents = !!eventsByDay[day]
                const isSelected = selectedDay === day
                const _isToday = isToday(day)

                return (
                  <button
                    key={day}
                    onClick={() => setSelectedDay(day === selectedDay ? null : day)}
                    style={{
                      border: 'none', cursor: 'pointer', borderRadius: 10,
                      padding: '6px 2px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 3, position: 'relative',
                      background: isSelected
                        ? 'linear-gradient(135deg,rgba(255,107,157,0.25),rgba(255,142,114,0.15))'
                        : _isToday
                        ? 'rgba(255,255,255,0.06)'
                        : 'transparent',
                      outline: isSelected ? '1px solid rgba(255,107,157,0.4)' : _isToday ? '1px solid rgba(255,255,255,0.12)' : 'none',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span className="font-inter" style={{
                      fontSize: '0.82rem', fontWeight: _isToday ? 700 : 400,
                      color: isSelected ? 'var(--accent)' : _isToday ? '#FFF0F5' : '#A0A0C0',
                    }}>
                      {day}
                    </span>
                    {hasEvents && (
                      <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 28 }}>
                        {eventsByDay[day].slice(0, 3).map(ev => (
                          <div key={ev.id} style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: personColors[ev.personId] ?? 'var(--accent)',
                          }} />
                        ))}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

        {/* Selected day events */}
        {selectedDay !== null && (
          <div style={{ marginBottom: 20 }}>
            <div className="font-inter" style={{
              fontSize: '0.72rem', color: '#6B6B8D', fontWeight: 600, textTransform: 'uppercase',
              letterSpacing: '0.08em', marginBottom: 10,
            }}>
              {selectedDay} {MONTHS[month].toLowerCase()} · {selectedEvents.length > 0 ? `${selectedEvents.length} событий` : 'нет событий'}
            </div>

            {selectedEvents.length === 0 ? (
              <div className="glass-light" style={{
                borderRadius: 16, padding: '20px', textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🗓️</div>
                <p className="font-inter" style={{ color: '#6B6B8D', fontSize: '0.82rem', margin: 0 }}>
                  Событий нет. Хотите добавить?
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedEvents.map(ev => (
                  <div key={ev.id} style={{
                    borderRadius: 14, padding: '12px 14px',
                    background: 'linear-gradient(135deg, rgba(255,107,157,0.1) 0%, rgba(30,30,63,0.6) 100%)',
                    border: '1px solid rgba(255,107,157,0.18)',
                    display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: '1.5rem' }}>{ev.emoji}</span>
                    <div style={{ flex: 1 }}>
                      <div className="font-inter" style={{ fontSize: '0.88rem', fontWeight: 600, color: '#FFF0F5', marginBottom: 2 }}>
                        {ev.title}
                      </div>
                      <div className="font-inter" style={{ fontSize: '0.7rem', color: '#6B6B8D' }}>
                          {(ev as any).note ?? ev.personName ?? ''}
                        </div>
                    </div>
                    <button
                      onClick={() => deleteEvent(ev.id)}
                      style={{
                        border: 'none', background: 'rgba(255,255,255,0.08)',
                        color: '#FF6B6B', borderRadius: 10, padding: '6px 10px', cursor: 'pointer',
                      }}
                    >
                      Удалить
                    </button>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: personColors[ev.personId] ?? 'var(--accent)',
                      flexShrink: 0,
                    }} />
                  </div>
                ))}
              </div>
            )}

            <div className="glass-light" style={{ borderRadius: 18, padding: '18px 16px', marginTop: 18 }}>
              <div className="font-inter" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF0F5', marginBottom: 10 }}>
                Добавить событие на {selectedDay} {MONTHS[month].toLowerCase()}
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <input
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  placeholder="Название события"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 14,
                    border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
                    color: '#f8f8fb', outline: 'none', fontSize: '0.9rem',
                  }}
                />
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  <input
                    value={newEventEmoji}
                    onChange={(e) => setNewEventEmoji(e.target.value)}
                    placeholder="Эмодзи"
                    style={{
                      width: 80, padding: '12px 14px', borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
                      color: '#f8f8fb', outline: 'none', fontSize: '0.9rem', textAlign: 'center',
                    }}
                  />
                  <input
                    value={newEventNote}
                    onChange={(e) => setNewEventNote(e.target.value)}
                    placeholder="Дополнение"
                    style={{
                      flex: 1, padding: '12px 14px', borderRadius: 14,
                      border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)',
                      color: '#f8f8fb', outline: 'none', fontSize: '0.9rem',
                    }}
                  />
                </div>
                <button
                  onClick={addEvent}
                  style={{
                    width: '100%', padding: '14px', borderRadius: 14,
                    border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, rgba(248,113,113,1), rgba(255,142,114,1))',
                    color: '#fff', fontWeight: 600,
                  }}
                >
                  Добавить событие
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add anniversary box */}
        {selectedDay !== null && (
          <div style={{ marginTop: 8 }}>
            <div className="font-inter" style={{ fontSize: '0.72rem', color: '#6B6B8D', fontWeight: 600, marginBottom: 8 }}>
              Годовщины на {selectedDay} {MONTHS[month].toLowerCase()}
            </div>

            
          </div>
        )}

        {/* Upcoming events */}
        <div>
          <div className="font-inter" style={{
            fontSize: '0.72rem', color: '#6B6B8D', fontWeight: 600, textTransform: 'uppercase',
            letterSpacing: '0.08em', marginBottom: 10,
          }}>
            Ближайшие события
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {upcoming.map(ev => {
              const diffMs = ev.date.getTime() - today.getTime()
              const diffDays = Math.ceil(diffMs / 86400000)
              return (
                <div key={ev.id} className="anim-fade-up" style={{
                  borderRadius: 16, padding: '12px 16px',
                  background: 'rgba(30,30,63,0.5)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  display: 'flex', alignItems: 'center', gap: 14,
                  cursor: 'pointer',
                }}
                onClick={() => {
                  setYear(ev.date.getFullYear())
                  setMonth(ev.date.getMonth())
                  setSelectedDay(ev.date.getDate())
                }}
                >
                  <div className="font-playfair" style={{
                    fontSize: 22, fontWeight: 700, minWidth: 36, textAlign: 'center',
                    background: 'var(--accent-gradient)',
                    WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    lineHeight: 1,
                  }}>
                    {diffDays}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-inter" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#FFF0F5', marginBottom: 2 }}>
                      {ev.title}
                    </div>
                    <div className="font-inter" style={{ fontSize: '0.7rem', color: '#6B6B8D' }}>
                      {ev.date.toLocaleDateString('ru', { day: 'numeric', month: 'long' })} · {(ev as any).note ?? ev.personName ?? ''}
                    </div>
                  </div>
                  <span style={{ fontSize: '1.3rem' }}>{ev.emoji}</span>
                </div>
              )
            })}
          </div>
        </div>
        {/* Anniversary form at page bottom */}
        {selectedDay !== null && (
          <div style={{ marginTop: 20, width: '100%' }}>
            <div className="font-inter" style={{ fontSize: '0.78rem', color: '#6B6B8D', fontWeight: 600, marginBottom: 10 }}>
              Годовщины · {selectedDay} {MONTHS[month].toLowerCase()}
            </div>

            <div className="ann-box anim-slide-in" style={{ width: '100%' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  value={newAnnEmoji}
                  onChange={(e) => setNewAnnEmoji(e.target.value)}
                  placeholder="Эмодзи"
                  className="ann-input smooth-focus anim-fade-up"
                  style={{ width: 84, fontSize: '1.2rem', textAlign: 'center' }}
                />

                <input
                  value={newAnnName}
                  onChange={(e) => setNewAnnName(e.target.value)}
                  placeholder="Кому посвящена годовщина"
                  className="ann-input smooth-focus anim-fade-up"
                  style={{ width: '100%' }}
                />

                <input type="date" value={newAnnDate ?? ''} onChange={(e) => setNewAnnDate(e.target.value)} className="ann-input smooth-focus anim-fade-up" />

                <input value={newAnnNote} onChange={(e) => setNewAnnNote(e.target.value)} placeholder="Дополнение" className="ann-input smooth-focus anim-fade-up" />

                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={addAnniversary} className="ann-add-btn anim-pop" style={{ flex: 1 }}>
                    Добавить годовщину
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {Object.values(eventsByDay).flat().filter((ev: any) => ev.isAnniversary && ev.date.getDate() === selectedDay).map((ev: any) => (
                    <div key={ev.id} className="ann-list-item anim-fade-up">
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <div style={{ fontSize: '1.2rem' }}>{ev.emoji}</div>
                        <div className="font-inter">{ev.title}{(ev as any).note ? ` — ${(ev as any).note}` : ''}</div>
                      </div>
                      <button onClick={() => deleteAnniversary(ev.id)} style={{ color: '#FF6B6B', background: 'transparent', border: 'none', cursor: 'pointer' }}>Удалить</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
