import { useRef, useState } from 'react'
import { film } from '../content'
import { formatTime } from '../lib/format'
import { Reveal } from './Reveal'
import { SectionHead } from './SectionHead'
import { VideoPlayer, type VideoPlayerHandle } from './VideoPlayer'
import './FilmSection.css'

export function FilmSection() {
  const player = useRef<VideoPlayerHandle>(null)
  const [chapter, setChapter] = useState(-1)
  const chapters = film.chapters ?? []

  return (
    <section id="film" className="section film" tabIndex={-1} aria-labelledby="film-title">
      <SectionHead id="film-title" eyebrow={film.eyebrow} title={film.title} />
      <div className="container">
        <Reveal y={50}>
          <VideoPlayer ref={player} video={film} onChapterChange={setChapter} />
        </Reveal>
        <div className="film__info">
          <Reveal>
            <p className="film__description">{film.description}</p>
          </Reveal>
          {chapters.length > 0 && (
            <Reveal delay={0.1}>
              <ol className="film__chapters" aria-label="Главы фильма">
                {chapters.map((c, i) => (
                  <li key={c.time}>
                    <button
                      className={`film__chapter ${i === chapter ? 'is-active' : ''}`}
                      onClick={() => player.current?.playFrom(c.time)}
                      aria-current={i === chapter ? 'true' : undefined}
                    >
                      <span className="film__chapter-time">{formatTime(c.time)}</span>
                      <span>{c.label}</span>
                    </button>
                  </li>
                ))}
              </ol>
            </Reveal>
          )}
        </div>
      </div>
    </section>
  )
}
