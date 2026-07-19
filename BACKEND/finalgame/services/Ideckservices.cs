using System;
using System.Collections.Generic;
using finalgame.Models;
using System.Linq;
namespace finalgame.Services
{
    // The Interface
    public interface IDeckService
    {
        GameSessionDto GenerateNewRound();
    }

    // The Implementation (Note the class name is DeckService, NOT IDeckService!)
    public class DeckService : IDeckService
    {
        private static readonly string[] Suits = { "♠", "♥", "♦", "♣" };
        private static readonly string[] Ranks = { "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A" };

        public GameSessionDto GenerateNewRound()
        {
            var fullDeck = new List<(string Suit, string Rank)>();
            foreach (var suit in Suits)
            {
                foreach (var rank in Ranks)
                {
                    fullDeck.Add((suit, rank));
                }
            }

            var rand = new Random();
            var shuffledList = fullDeck.OrderBy(x => rand.Next()).ToList();
            var selectedCards = shuffledList.Take(9).ToList();

            var gridCards = new List<CardDto>();
            for (int i = 0; i < selectedCards.Count; i++)
            {
                var card = selectedCards[i];
                var themes = GetThemeForSuit(card.Suit, rand);

                gridCards.Add(new CardDto
                {
                    CardId = i,
                    Suit = card.Suit,
                    Rank = card.Rank,
                    ThemeColor = themes.ThemeColor,
                    TextColor = themes.TextColor
                });
            }

            int targetIndex = rand.Next(0, 9);
            var targetCard = gridCards[targetIndex];

            return new GameSessionDto
            {
                GameSessionId = Guid.NewGuid().ToString(),
                TargetCard = new CardDto
                {
                    CardId = targetCard.CardId,
                    Suit = targetCard.Suit,
                    Rank = targetCard.Rank,
                    ThemeColor = targetCard.ThemeColor,
                    TextColor = targetCard.TextColor
                },
                GridCards = gridCards
            };
        }

        private (string ThemeColor, string TextColor) GetThemeForSuit(string suit, Random rand)
        {
            if (suit == "♥" || suit == "♦")
            {
                return ("neon-border-red", "red-text");
            }
            else
            {
                var choices = new[] { 
                    ("neon-border-green", "green-text"), 
                    ("neon-border-purple", "purple-text"),
                    ("neon-border-cyan", "cyan-text") 
                };
                return choices[rand.Next(choices.Length)];
            }
        }
    }
}