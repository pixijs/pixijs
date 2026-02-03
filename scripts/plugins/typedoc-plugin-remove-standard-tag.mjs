import { Converter } from 'typedoc';

export function load(app)
{
    app.converter.on(
        Converter.EVENT_CREATE_DECLARATION,
        (_context, reflection) =>
        {
            if (!reflection || !reflection.comment)
            {
                return;
            }
            if (reflection.comment.getTag('@standard'))
            {
                reflection.comment.removeTags('@standard');
            }
        },
    );
}
