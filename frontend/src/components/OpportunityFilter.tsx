'use client';

interface OpportunityFilterProps {
  comments: Array<Record<string, unknown>>;
  postDetails: Record<string, unknown> | null;
}

export default function OpportunityFilter({ comments }: OpportunityFilterProps) {
  return (
    <section className="bg-[#162032] border border-[#24334A] rounded-2xl p-6">
      <h2 className="text-lg font-bold text-white mb-4">Comentarios y oportunidades</h2>
      <div className="space-y-3">
        {comments.map((comment, index) => {
          const text = comment.text ?? comment.comment ?? comment.comentario;
          const author = comment.username ?? comment.user ?? comment.usuario;
          return (
            <article key={String(comment.id ?? index)} className="bg-[#0B121E] rounded-xl p-4">
              <p className="text-sm text-slate-300">{String(text ?? 'Comentario sin texto')}</p>
              {author != null && <p className="text-xs text-slate-500 mt-2">@{String(author)}</p>}
            </article>
          );
        })}
      </div>
    </section>
  );
}
