"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Clock,
  Users,
  Bookmark,
  ThumbsUp,
  Printer,
  Share2,
  ChevronDown,
  ChefHat,
  Flame,
  Leaf,
  Heart,
  Recycle
} from "lucide-react"
import { Header } from "@/components/header"
import { FeedbackContainer } from "@/components/feedback-container"
import useDataStore from "../../store/DataStore";
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface Recipe {
  id: number;
  title: string;
  time: string;
  servings: string;
  difficulty: string;
  calories: string;
  tags: string[];
  description: string;
  ingredients: string[];
  instructions: string[];
}

interface Advice {
  title: string;
  content: string[];
}



export default function ResultsPage() {
  const [activeTab, setActiveTab] = useState("recipes")
  const [isLoaded, setIsLoaded] = useState(false)
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const detectedIngredients = useDataStore((state : any) => state.detectedIngredients);


  const recipes = useDataStore((state : any) => state.recipes);

  
  const advice = [
    {
      title: "Storage Tips",
      icon: <Leaf className="h-6 w-6" />,
      content: [
        "Store tomatoes at room temperature, not in the refrigerator, for best flavor.",
        "Keep onions in a cool, dry place with good air circulation.",
        "Store bell peppers in the refrigerator crisper drawer for up to a week.",
        "Keep zucchini in a perforated plastic bag in the refrigerator for up to 5 days.",
        "Store eggplant in the refrigerator for 3-4 days.",
      ],
    },
    {
      title: "Preservation Methods",
      icon: <Flame className="h-6 w-6" />,
      content: [
        "Freeze diced tomatoes for future use in soups and sauces.",
        "Pickle onions to extend their shelf life and add flavor to salads and sandwiches.",
        "Roast and freeze bell peppers for easy addition to future meals.",
        "Grate and freeze zucchini for use in baking or soups.",
        "Roast eggplant slices and freeze for later use in dips or pasta dishes.",
      ],
    },
    {
      title: "Nutrition Information",
      icon: <Heart className="h-6 w-6" />,
      content: [
        "Tomatoes are rich in lycopene, an antioxidant that may reduce the risk of heart disease and cancer.",
        "Onions contain quercetin, which has anti-inflammatory properties.",
        "Bell peppers are high in vitamin C and antioxidants.",
        "Zucchini is low in calories and high in water content, making it great for weight management.",
        "Eggplant is high in fiber and contains nasunin, an antioxidant that protects brain cells.",
      ],
    },
  ]
    
  const getRandomNumber = (min: number, max: number): number => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const getImage = async(food : string, orientation: string) => {
    try{
      const result = await axios.get(`https://api.unsplash.com/search/photos?query=${food}&client_id=pxlmlb-GuT3JdOD07V4YMfG3OjQZQ8ursRI-Nge3_Mc&orientation=${orientation}`);
      return result.data.results[getRandomNumber(0, 4)]?.urls?.regular
    }
    catch (error){
      console.log(error)
      return '/placeholder.svg'
    }

  }
  const [imageMap, setImageMap] = useState<Record<string, string>>({});
  
  useEffect(() => {
    const fetchImages = async () => {
      const titles = [...new Set(recipes.map((r : any) => r.title))];
      const newImageMap: Record<string, string> = {};
      await Promise.all(
        titles.map(async (title: any) => {
          try {
            const img = await getImage(title, "landscape");
            newImageMap[title] = img;
          } catch (error) {
            console.log(error)
            newImageMap[title] = "/placeholder.svg";
          }
        })
      );

      setImageMap(newImageMap);
    };

    fetchImages();
  }, []);

  const [imgHead, setHeadimg] = useState("")
  useEffect(() => {
    const fetchHeader = async () => {
      const prompt = detectedIngredients[0]
      try {
        const img = await getImage(prompt, "landscape");
        setHeadimg(img);
      } catch (error) {
        setHeadimg("/placeholder.svg");
      }
    }
    fetchHeader();
  }, [detectedIngredients]);
  
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe>(recipes[0]);  
  const [savedRecipes, setSavedRecipes] = useState<number[]>([])
  const [likedRecipes, setLikedRecipes] = useState<number[]>([])

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const toggleSaved = (id: number) => {
    if (savedRecipes.includes(id)) {
      setSavedRecipes(savedRecipes.filter((recipeId) => recipeId !== id))
    } else {
      setSavedRecipes([...savedRecipes, id])
    }
  }

  const toggleLiked = (id: number) => {
    if (likedRecipes.includes(id)) {
      setLikedRecipes(likedRecipes.filter((recipeId) => recipeId !== id))
    } else {
      setLikedRecipes([...likedRecipes, id])
    }
  }


  useEffect(() => {
    setIsClient(true)
    
    // Check if required data exists
    if (!detectedIngredients || detectedIngredients.length === 0 || !recipes || recipes.length === 0) {
      // Redirect to home if no data is available
      router.push('/')
      return
    }
    
    setIsLoaded(true)
  }, [detectedIngredients, recipes, router])
  
  
  if (!isClient || !isLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div
      className={`min-h-screen bg-background transition-opacity duration-500 ${isLoaded ? "opacity-100" : "opacity-0"}`}
    >
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl p-6 mb-8 border border-border shadow-md animate-fade-in">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/3">
              <div className="rounded-lg overflow-hidden shadow-md transform transition-transform hover:scale-[1.02] duration-300">
                <img src={imgHead || "/placeholder.svg"} alt="Uploaded food" className="w-full h-auto" />
              </div>
            </div>
            <div className="md:w-2/3">
              <h1 className="text-3xl font-bold mb-4 flex items-center">
                <span className="gradient-text">AI Analysis</span>
                <div className="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/20 text-primary">
                  Powered by AI
                </div>
              </h1>
              <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Detected Ingredients:</h2>
                <div className="flex flex-wrap gap-2">
                  {detectedIngredients.map((ingredient: any, index : any) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-card rounded-full text-sm font-medium border border-border transition-all duration-300 hover:border-primary hover:bg-primary/5 cursor-pointer"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
              <p className="text-muted-foreground">
                Based on these ingredients, we've generated some recipes and advice to help you reduce food waste.
                Explore the tabs below to see what you can make!
              </p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="recipes" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="recipes" className="">
              <ChefHat className="mr-2 h-4 w-4" />
              Recipes
            </TabsTrigger>
            <TabsTrigger value="advice" className="">
              <Leaf className="mr-2 h-4 w-4" />
              Food Waste Advice
            </TabsTrigger>
          </TabsList>

          <TabsContent value="recipes" className="mt-0 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <h2 className="text-xl font-bold flex items-center">
                  <ChefHat className="mr-2 h-5 w-5 text-primary" />
                  Suggested Recipes
                </h2>
                <div className="space-y-4">
                  {recipes.map((recipe : any) => (
                    <Card
                      key={recipe.id}
                      className={`p-4 cursor-pointer transition-all duration-300 ${
                        selectedRecipe.id === recipe.id
                          ? "gradient-border shadow-lg transform translate-y-[-2px]"
                          : "hover:border-primary/50 hover:shadow-md hover:translate-y-[-2px]"
                      }`}
                      onClick={() => setSelectedRecipe(recipe)}
                    >
                      <div className="flex gap-4">
                        <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0 shadow-sm">
                          <img
                            src={imageMap[recipe.title] || "/placeholder.svg"}
                            alt={recipe.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                          />
                        </div>
                        <div>
                          <h3 className="font-semibold">{recipe.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {recipe.time}
                            </span>
                            <span className="flex items-center">
                              <Users className="h-3 w-3 mr-1" />
                              {recipe.servings}
                            </span>
                          </div>
                          <span className="inline-block mt-2 text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {recipe.difficulty}
                          </span>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="lg:col-span-2">
                <Card className="overflow-hidden border border-border shadow-lg">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={imageMap[selectedRecipe.title] || "/placeholder.svg"}
                      alt={selectedRecipe.title}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                    <div className="absolute top-4 right-4 flex gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        className={`rounded-full glass-effect hover:bg-background/90 transition-all duration-300 ${
                          savedRecipes.includes(selectedRecipe.id) ? "bg-primary/20 text-primary" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleSaved(selectedRecipe.id)
                        }}
                      >
                        <Bookmark
                          className={`h-4 w-4 ${savedRecipes.includes(selectedRecipe.id) ? "fill-primary" : ""}`}
                        />
                      </Button>
                      <Button
                        size="icon"
                        variant="secondary"
                        className={`rounded-full glass-effect hover:bg-background/90 transition-all duration-300 ${
                          likedRecipes.includes(selectedRecipe.id) ? "bg-primary/20 text-primary" : ""
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          toggleLiked(selectedRecipe.id)
                        }}
                      >
                        <ThumbsUp
                          className={`h-4 w-4 ${likedRecipes.includes(selectedRecipe.id) ? "fill-primary" : ""}`}
                        />
                      </Button>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <div className="flex flex-wrap gap-2">
                        {selectedRecipe.tags.map((tag : any, index : any) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-white/20 backdrop-blur-sm text-white rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-2xl font-bold mb-1">{selectedRecipe.title}</h2>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {selectedRecipe.time}
                          </span>
                          <span className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            Serves {selectedRecipe.servings}
                          </span>
                          <span className="flex items-center">
                            <Flame className="h-4 w-4 mr-1" />
                            {selectedRecipe.calories} cal
                          </span>
                          <span className="inline-block text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                            {selectedRecipe.difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="hidden md:flex">
                          <Printer className="h-4 w-4 mr-2" />
                          Print
                        </Button>
                        <Button size="sm" variant="outline" className="hidden md:flex">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </div>
                    </div>

                    <p className="text-muted-foreground mb-6">{selectedRecipe.description}</p>

                    <div className="mb-6">
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                          <ChefHat className="h-3 w-3" />
                        </span>
                        Ingredients
                      </h3>
                      <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {selectedRecipe.ingredients.map((ingredient : any, index : any) => (
                          <li key={index} className="flex items-start gap-2 group">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover:scale-150 transition-transform duration-300"></div>
                            <span className="group-hover:text-primary transition-colors duration-300">
                              {ingredient}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center">
                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-2">
                          <Flame className="h-3 w-3" />
                        </span>
                        Instructions
                      </h3>
                      <ol className="space-y-4">
                        {selectedRecipe.instructions.map((instruction : any, index : any) => (
                          <li key={index} className="flex gap-3 group">
                            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                              {index + 1}
                            </div>
                            <p className="text-card-foreground group-hover:text-foreground transition-colors duration-300">
                              {instruction}
                            </p>
                          </li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advice" className="mt-0 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {advice?.map((section: any, index : any) => (
                <Card
                  key={index}
                  className="p-6 border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-5px] group"
                >
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                      {section.icon}
                    </div>
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.content.map((tip: any, tipIndex : any) => (
                      <li key={tipIndex} className="flex items-start gap-2 group/item">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 group-hover/item:scale-150 transition-transform duration-300"></div>
                        <span className="text-card-foreground group-hover/item:text-foreground transition-colors duration-300">
                          {tip}
                        </span>
                      </li>
                    ))}
                  </ul>
                </Card>
              ))}
            </div>

            <div className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 dark:from-primary/20 dark:to-primary/10 rounded-xl p-6 border border-border shadow-md">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Leaf className="h-5 w-5 mr-2 text-primary" />
                Did You Know?
              </h3>
              <p className="text-card-foreground mb-6">
                Approximately one-third of all food produced globally is lost or wasted, amounting to about 1.3 billion
                tons per year. By using apps like FoodRescue, you can help reduce this waste and save money on your
                grocery bills.
              </p>
              <div className="flex justify-center">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground group relative overflow-hidden">
                  <span className="absolute inset-0 w-full h-full transition-all duration-300 scale-x-0 transform group-hover:scale-x-100 group-hover:bg-white/10"></span>
                  Learn More About Food Waste
                  <ChevronDown className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-y-1" />
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-center mt-12 mb-8">
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 text-lg flex items-center gap-2 group">
              <Recycle className="h-5 w-5 group-hover:rotate-180 transition-transform duration-500" />
              Recycle
            </Button>
          </Link>
        </div>
      </main>

      {/* Feedback Container */}
      <FeedbackContainer />

      {/* Footer */}
      <footer className="bg-muted/50 dark:bg-muted/20 py-6 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            © {new Date().getFullYear()} FoodRescue. All recipes are AI-generated based on detected ingredients.
          </p>
        </div>
      </footer>
    </div>
  )
}
