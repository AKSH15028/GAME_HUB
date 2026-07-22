using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace finalgame.Controllers
{
    public class QuizQuestionDto
    {
        public int Id { get; set; }
        public string Category { get; set; } = string.Empty;
        public string QuestionText { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new List<string>();
        public int CorrectOptionIndex { get; set; }
        public string Explanation { get; set; } = string.Empty;
        public string Difficulty { get; set; } = "Medium";
    }

    public class QuizAnswerSubmissionDto
    {
        public int QuestionId { get; set; }
        public int SelectedOptionIndex { get; set; }
        public int SecondsRemaining { get; set; }
        public int CurrentStreak { get; set; }
        public string Username { get; set; } = "GuestPlayer";
    }

    public class QuizAnswerResultDto
    {
        public bool IsCorrect { get; set; }
        public int CorrectOptionIndex { get; set; }
        public int PointsEarned { get; set; }
        public string Explanation { get; set; } = string.Empty;
    }

    [ApiController]
    [Route("api/game2")]
    public class Game2Controller : ControllerBase
    {
        private static readonly List<QuizQuestionDto> Questions = new List<QuizQuestionDto>
        {
            // Tech & Gaming
            new QuizQuestionDto {
                Id = 101, Category = "Tech & Gaming", QuestionText = "What year was the original Super Mario Bros. released on NES?",
                Options = new List<string> { "1983", "1985", "1987", "1990" }, CorrectOptionIndex = 1,
                Explanation = "Super Mario Bros. was released on September 13, 1985 in Japan.", Difficulty = "Easy"
            },
            new QuizQuestionDto {
                Id = 102, Category = "Tech & Gaming", QuestionText = "Which programming language was created by Brendan Eich in just 10 days?",
                Options = new List<string> { "Python", "Java", "JavaScript", "C#" }, CorrectOptionIndex = 2,
                Explanation = "JavaScript was created by Brendan Eich at Netscape in September 1995.", Difficulty = "Easy"
            },
            new QuizQuestionDto {
                Id = 103, Category = "Tech & Gaming", QuestionText = "What does HTTP stand for?",
                Options = new List<string> { "HyperText Transfer Protocol", "High Transfer Text Protocol", "Hyperlink Text Transmission Process", "Home Tool Transfer Program" }, CorrectOptionIndex = 0,
                Explanation = "HTTP stands for HyperText Transfer Protocol, the foundation of data communication on the World Wide Web.", Difficulty = "Easy"
            },
            new QuizQuestionDto {
                Id = 104, Category = "Tech & Gaming", QuestionText = "Which open-source game engine uses GDScript?",
                Options = new List<string> { "Unreal Engine", "Unity", "Godot", "CryEngine" }, CorrectOptionIndex = 2,
                Explanation = "Godot engine features GDScript, a Python-like scripting language designed specifically for Godot.", Difficulty = "Medium"
            },
            new QuizQuestionDto {
                Id = 105, Category = "Tech & Gaming", QuestionText = "What was the highest-selling video game console of all time?",
                Options = new List<string> { "Nintendo DS", "PlayStation 2", "Game Boy", "Nintendo Switch" }, CorrectOptionIndex = 1,
                Explanation = "PlayStation 2 holds the record with over 155 million units sold worldwide.", Difficulty = "Medium"
            },

            // Science & Nature
            new QuizQuestionDto {
                Id = 201, Category = "Science & Nature", QuestionText = "What element does the chemical symbol 'Au' represent?",
                Options = new List<string> { "Silver", "Aluminum", "Gold", "Argon" }, CorrectOptionIndex = 2,
                Explanation = "'Au' comes from the Latin word for gold, 'Aurum'.", Difficulty = "Easy"
            },
            new QuizQuestionDto {
                Id = 202, Category = "Science & Nature", QuestionText = "What is the speed of light in vacuum approximately?",
                Options = new List<string> { "300,000 km/s", "150,000 km/s", "1,000,000 km/s", "30,000 km/s" }, CorrectOptionIndex = 0,
                Explanation = "Light travels at approximately 299,792 km/s (300,000 km/s) in a vacuum.", Difficulty = "Medium"
            },
            new QuizQuestionDto {
                Id = 203, Category = "Science & Nature", QuestionText = "Which planet in our solar system has the most moons?",
                Options = new List<string> { "Jupiter", "Saturn", "Uranus", "Neptune" }, CorrectOptionIndex = 1,
                Explanation = "Saturn currently leads with 146 confirmed moons.", Difficulty = "Medium"
            },
            new QuizQuestionDto {
                Id = 204, Category = "Science & Nature", QuestionText = "What is the powerhouse of the cell?",
                Options = new List<string> { "Nucleus", "Ribosome", "Mitochondria", "Endoplasmic Reticulum" }, CorrectOptionIndex = 2,
                Explanation = "Mitochondria generate most of the chemical energy (ATP) needed by the cell.", Difficulty = "Easy"
            },

            // General Knowledge
            new QuizQuestionDto {
                Id = 301, Category = "General Knowledge", QuestionText = "Which country has the largest surface area in the world?",
                Options = new List<string> { "Canada", "China", "United States", "Russia" }, CorrectOptionIndex = 3,
                Explanation = "Russia covers over 17 million square kilometers, making it the largest nation by land area.", Difficulty = "Easy"
            },
            new QuizQuestionDto {
                Id = 302, Category = "General Knowledge", QuestionText = "How many keys are on a standard acoustic piano?",
                Options = new List<string> { "64", "76", "88", "96" }, CorrectOptionIndex = 2,
                Explanation = "A standard piano features 88 keys: 52 white keys and 36 black keys.", Difficulty = "Easy"
            },
            new QuizQuestionDto {
                Id = 303, Category = "General Knowledge", QuestionText = "Which ocean is the largest and deepest on Earth?",
                Options = new List<string> { "Atlantic Ocean", "Indian Ocean", "Southern Ocean", "Pacific Ocean" }, CorrectOptionIndex = 3,
                Explanation = "The Pacific Ocean covers over 30% of the Earth's surface and contains the Mariana Trench.", Difficulty = "Easy"
            },

            // Pop Culture & History
            new QuizQuestionDto {
                Id = 401, Category = "Pop Culture & History", QuestionText = "In which year did the Apollo 11 moon landing occur?",
                Options = new List<string> { "1965", "1969", "1971", "1973" }, CorrectOptionIndex = 1,
                Explanation = "Apollo 11 landed Neil Armstrong and Buzz Aldrin on the Moon on July 20, 1969.", Difficulty = "Medium"
            },
            new QuizQuestionDto {
                Id = 402, Category = "Pop Culture & History", QuestionText = "Who painted the Mona Lisa?",
                Options = new List<string> { "Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci", "Claude Monet" }, CorrectOptionIndex = 2,
                Explanation = "Leonardo da Vinci painted the Mona Lisa in the early 16th century.", Difficulty = "Easy"
            }
        };

        [HttpGet("categories")]
        public IActionResult GetCategories()
        {
            var categories = Questions.Select(q => q.Category).Distinct().ToList();
            return Ok(categories);
        }

        [HttpGet("questions")]
        public IActionResult GetQuestions([FromQuery] string? category = null, [FromQuery] int count = 8)
        {
            var query = Questions.AsEnumerable();
            if (!string.IsNullOrEmpty(category) && category != "All")
            {
                query = query.Where(q => q.Category.Equals(category, StringComparison.OrdinalIgnoreCase));
            }

            var shuffled = query.OrderBy(_ => Guid.NewGuid()).Take(count).ToList();
            return Ok(shuffled);
        }

        [HttpPost("answer")]
        public IActionResult VerifyAnswer([FromBody] QuizAnswerSubmissionDto request)
        {
            var q = Questions.FirstOrDefault(x => x.Id == request.QuestionId);
            if (q == null) return NotFound("Question not found.");

            bool isCorrect = request.SelectedOptionIndex == q.CorrectOptionIndex;
            int points = 0;

            if (isCorrect)
            {
                int timeBonus = Math.Max(0, request.SecondsRemaining) * 15;
                int streakBonus = request.CurrentStreak * 25;
                points = 100 + timeBonus + streakBonus;
            }

            return Ok(new QuizAnswerResultDto
            {
                IsCorrect = isCorrect,
                CorrectOptionIndex = q.CorrectOptionIndex,
                PointsEarned = points,
                Explanation = q.Explanation
            });
        }
    }
}
