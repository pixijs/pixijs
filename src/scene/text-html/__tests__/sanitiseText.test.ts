import { HTMLText } from '../HTMLText';

describe('HTMLText', () =>
{
    describe('text sanitization', () =>
    {
        let htmlText: HTMLText;

        beforeEach(() =>
        {
            htmlText = new HTMLText();
        });

        describe('_sanitiseText', () =>
        {
            it('should replace <br> tags with self-closing <br/> tags', () =>
            {
                const input = 'Line 1<br>Line 2<BR>Line 3<Br>Line 4';
                const expected = 'Line 1<br/>Line 2<br/>Line 3<br/>Line 4';

                // Access private method for testing
                const result = htmlText['_sanitiseText'](input);

                expect(result).toBe(expected);
            });

            it('should replace <hr> tags with self-closing <hr/> tags', () =>
            {
                const input = 'Section 1<hr>Section 2<HR>Section 3<Hr>';
                const expected = 'Section 1<hr/>Section 2<hr/>Section 3<hr/>';

                const result = htmlText['_sanitiseText'](input);

                expect(result).toBe(expected);
            });

            it('should replace &nbsp; with &#160;', () =>
            {
                const input = 'Text&nbsp;with&nbsp;spaces';
                const expected = 'Text&#160;with&#160;spaces';

                const result = htmlText['_sanitiseText'](input);

                expect(result).toBe(expected);
            });

            it('should handle mixed case &nbsp; entities', () =>
            {
                const input = 'Text&nbsp;with&NBSP;different&Nbsp;cases';
                const expected = 'Text&#160;with&#160;different&#160;cases';

                const result = htmlText['_sanitiseText'](input);

                expect(result).toBe(expected);
            });

            it('should remove broken HTML tags', () =>
            {
                const input = '<div>Valid</div><broken<p>Another</p>';
                const expected = '<div>Valid</div><p>Another</p>';

                const result = htmlText['_sanitiseText'](input);

                expect(result).toBe(expected);
            });

            it('should handle complex mixed sanitization', () =>
            {
                const input = '<div>Text<br>New&nbsp;line<broken<p>Valid</p><hr>End';
                const expected = '<div>Text<br/>New&#160;line<p>Valid</p><hr/>End';

                const result = htmlText['_sanitiseText'](input);

                expect(result).toBe(expected);
            });

            it('should handle empty string', () =>
            {
                const input = '';
                const expected = '';

                const result = htmlText['_sanitiseText'](input);

                expect(result).toBe(expected);
            });

            it('should handle string with no HTML', () =>
            {
                const input = 'Just plain text with no HTML';
                const expected = 'Just plain text with no HTML';

                const result = htmlText['_sanitiseText'](input);

                expect(result).toBe(expected);
            });
        });

        describe('_removeInvalidHtmlTags', () =>
        {
            it('should remove broken opening tags', () =>
            {
                const input = 'Valid text <broken and more text';
                const expected = 'Valid text ';

                const result = htmlText['_removeInvalidHtmlTags'](input);

                expect(result).toBe(expected);
            });

            it('should remove incomplete tags with attributes', () =>
            {
                const input = '<div class="test">Valid</div><span id="broken class="test"<p>More</p>';
                const expected = '<div class="test">Valid</div><p>More</p>';

                const result = htmlText['_removeInvalidHtmlTags'](input);

                expect(result).toBe(expected);
            });

            it('should remove broken tags at end of string', () =>
            {
                const input = '<div>Valid content</div><broken';
                const expected = '<div>Valid content</div>';

                const result = htmlText['_removeInvalidHtmlTags'](input);

                expect(result).toBe(expected);
            });

            it('should handle multiple consecutive broken tags', () =>
            {
                const input = '<broken<another<div>Valid</div>';
                const expected = '<div>Valid</div>';

                const result = htmlText['_removeInvalidHtmlTags'](input);

                expect(result).toBe(expected);
            });

            it('should preserve valid self-closing tags', () =>
            {
                const input = '<br/><hr/><img src="test.jpg"/>';
                const expected = '<br/><hr/><img src="test.jpg"/>';

                const result = htmlText['_removeInvalidHtmlTags'](input);

                expect(result).toBe(expected);
            });

            it('should preserve valid HTML with attributes', () =>
            {
                const input = '<div class="test" id="myDiv">Content</div><span style="color: red;">Text</span>';
                const expected = '<div class="test" id="myDiv">Content</div><span style="color: red;">Text</span>';

                const result = htmlText['_removeInvalidHtmlTags'](input);

                expect(result).toBe(expected);
            });

            it('should handle broken tags mixed with valid ones', () =>
            {
                const input = '<div>Start<broken<strong>Bold</strong><incomplete id="test"<em>Italic</em>';
                const expected = '<div>Start<strong>Bold</strong><em>Italic</em>';

                const result = htmlText['_removeInvalidHtmlTags'](input);

                expect(result).toBe(expected);
            });

            it('should handle empty string', () =>
            {
                const input = '';
                const expected = '';

                const result = htmlText['_removeInvalidHtmlTags'](input);

                expect(result).toBe(expected);
            });

            it('should handle string with no HTML tags', () =>
            {
                const input = 'Just plain text with no tags';
                const expected = 'Just plain text with no tags';

                const result = htmlText['_removeInvalidHtmlTags'](input);

                expect(result).toBe(expected);
            });

            it('should handle only broken tags', () =>
            {
                const input = '<broken<another<incomplete';
                const expected = '';

                const result = htmlText['_removeInvalidHtmlTags'](input);

                expect(result).toBe(expected);
            });
        });

        describe('integration with text setter', () =>
        {
            it('should sanitize text when setting text property', () =>
            {
                const input = 'Line 1<br>Line 2&nbsp;spaced<broken<strong>Bold</strong>';
                const expected = 'Line 1<br/>Line 2&#160;spaced<strong>Bold</strong>';

                htmlText.text = input;

                expect(htmlText.text).toBe(expected);
            });

            it('should handle number input', () =>
            {
                htmlText.text = 12345;

                expect(htmlText.text).toBe('12345');
            });

            it('should handle object with toString method', () =>
            {
                const obj = {
                    toString: () => 'Custom<br>Object&nbsp;Text<broken'
                };

                htmlText.text = obj;

                expect(htmlText.text).toBe('Custom<br/>Object&#160;Text');
            });
        });
    });
});
