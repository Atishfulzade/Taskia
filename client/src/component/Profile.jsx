import React from "react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  LogOut,
  User,
  Mail,
  Calendar,
  Pencil,
  Save,
  X,
  Loader2,
  MapPin,
  Globe,
  Phone,
  Shield,
  Lock,
  AlertTriangle,
  Camera,
  CheckCircle2,
  BadgeCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Progress } from "@/components/ui/progress";

const requestServer = async (endpoint, method = "GET", data) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));

  if (endpoint === "user/profile/update") {
    return { success: true, message: "Profile updated successfully" };
  }

  return { success: true, data: { ...data } };
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
};

const getInitials = (name) => {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0]?.toUpperCase())
    .join("")
    .slice(0, 2);
};

export default function ProfilePage() {
  const { theme, setTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    phone: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        let user = storedUser ? JSON.parse(storedUser) : null;

        if (!user) {
          user = {
            id: "1",
            name: "Alex Morgan",
            email: "alex.morgan@example.com",
            avatar: "",
            bio: "Full-stack developer passionate about creating intuitive user experiences and scalable applications.",
            location: "San Francisco, CA",
            website: "https://alexmorgan.dev",
            phone: "+1 (555) 123-4567",
            createdAt: "2023-01-15T00:00:00.000Z",
            role: "Senior Developer",
            verified: true,
          };
        }

        setUserData(user);
        setFormData({
          name: user.name || "",
          email: user.email || "",
          bio: user.bio || "",
          location: user.location || "",
          website: user.website || "",
          phone: user.phone || "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to load profile data");
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await requestServer("user/profile/update", "PUT", formData);

      if (res.success) {
        const updatedUser = {
          ...userData,
          ...formData,
        };
        setUserData(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        toast.success("Profile updated successfully", {
          description: "Your profile information has been saved.",
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        setIsEditing(false);
      } else {
        toast.error(res.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();

      reader.onload = async (event) => {
        const avatarUrl = event.target?.result;

        await requestServer("user/profile/avatar", "PUT", {
          avatar: avatarUrl,
        });

        setUserData((prev) =>
          prev
            ? {
                ...prev,
                avatar: avatarUrl,
              }
            : null
        );

        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);
          user.avatar = avatarUrl;
          localStorage.setItem("user", JSON.stringify(user));
        }

        toast.success("Profile picture updated successfully", {
          description: "Your new profile picture has been saved.",
          icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        });
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error("Failed to update profile picture");
      setIsUploading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await requestServer("user/logout");
      toast.success(res.message || "Logged out successfully");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out. Please try again.");
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name || "",
        email: userData.email || "",
        bio: userData.bio || "",
        location: userData.location || "",
        website: userData.website || "",
        phone: userData.phone || "",
      });
    }
    setIsEditing(false);
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await requestServer("user/delete", "DELETE");
      toast.success("Account deleted successfully");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please try again.");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-8 px-4 md:px-6">
      <div className="flex flex-col gap-8">
        {/* Profile Header */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 p-8 text-white dark:from-primary-700 dark:to-primary-900">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-600 opacity-90 dark:from-primary-700 dark:to-primary-900"></div>
          <div className="absolute inset-0 bg-[url('/placeholder.svg?height=200&width=1000')] opacity-10 mix-blend-overlay"></div>

          <div className="relative flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="relative group">
              <Avatar className="h-22 w-22 border-4 border-white/20 shadow-xl">
                <AvatarImage src={userData.avatar} alt={userData.name} />
                <AvatarFallback className="bg-white text-violet-600 dark:bg-primary-800 dark:text-primary-200 text-2xl font-bold">
                  {getInitials(userData.name)}
                </AvatarFallback>
              </Avatar>

              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full 
                          opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                {isUploading ? (
                  <Loader2 className="h-8 w-8 animate-spin text-white" />
                ) : (
                  <Camera className="h-8 w-8 text-white" />
                )}
                <span className="sr-only">Upload new avatar</span>
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarUpload}
                disabled={isUploading}
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-slate-800">
                  {userData.name}
                </h1>
                {userData.verified && (
                  <Badge
                    variant="outline"
                    className="bg-white/10 text-white border-white/20 flex items-center gap-1"
                  >
                    <BadgeCheck className="h-3.5 w-3.5" />
                    Verified
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                <p className="text-slate-600 flex items-center gap-1.5 ">
                  <Mail className="h-4 w-4" />
                  {userData.email}
                </p>
                {userData.role && (
                  <p className="text-slate-600 flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {userData.role}
                  </p>
                )}
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  Member since {formatDate(userData.createdAt)}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Log Out
              </Button>
            </div>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-2 md:w-[400px] mb-4">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Bio Card */}
              <Card className="lg:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <div>
                    <CardTitle>About Me</CardTitle>
                    <CardDescription>
                      Your bio and personal information
                    </CardDescription>
                  </div>

                  {!isEditing ? (
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="outline"
                      size="sm"
                      className="h-8"
                    >
                      <Pencil className="h-3.5 w-3.5 mr-1.5" />
                      Edit
                    </Button>
                  ) : null}
                </CardHeader>

                <CardContent>
                  {!isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">
                          Bio
                        </h3>
                        <p className="text-sm">
                          {userData.bio || "No bio provided"}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {userData.location && (
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground">
                                Location
                              </h4>
                              <p className="text-sm">{userData.location}</p>
                            </div>
                          </div>
                        )}

                        {userData.website && (
                          <div className="flex items-start gap-2">
                            <Globe className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground">
                                Website
                              </h4>
                              <a
                                href={userData.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-primary hover:underline"
                              >
                                {userData.website.replace(/^https?:\/\//, "")}
                              </a>
                            </div>
                          </div>
                        )}

                        {userData.phone && (
                          <div className="flex items-start gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground mt-0.5" />
                            <div>
                              <h4 className="text-xs font-medium text-muted-foreground">
                                Phone
                              </h4>
                              <p className="text-sm">{userData.phone}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="name"
                            className="flex items-center gap-2"
                          >
                            <User className="h-4 w-4 text-muted-foreground" />
                            Full Name
                          </Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Your full name"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="flex items-center gap-2"
                          >
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            Email
                          </Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Your email address"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="bio"
                            className="flex items-center gap-2"
                          >
                            About Me
                          </Label>
                          <Textarea
                            id="bio"
                            name="bio"
                            value={formData.bio}
                            onChange={handleChange}
                            disabled={isLoading}
                            placeholder="Tell us about yourself"
                            rows={4}
                            className="resize-none"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor="location"
                              className="flex items-center gap-2"
                            >
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              Location
                            </Label>
                            <Input
                              id="location"
                              name="location"
                              value={formData.location}
                              onChange={handleChange}
                              disabled={isLoading}
                              placeholder="City, Country"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="website"
                              className="flex items-center gap-2"
                            >
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              Website
                            </Label>
                            <Input
                              id="website"
                              name="website"
                              value={formData.website}
                              onChange={handleChange}
                              disabled={isLoading}
                              placeholder="https://yourwebsite.com"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label
                              htmlFor="phone"
                              className="flex items-center gap-2"
                            >
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              Phone
                            </Label>
                            <Input
                              id="phone"
                              name="phone"
                              value={formData.phone}
                              onChange={handleChange}
                              disabled={isLoading}
                              placeholder="Your phone number"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-2">
                        <Button
                          type="button"
                          onClick={handleCancel}
                          variant="outline"
                          disabled={isLoading}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="h-4 w-4 mr-2" />
                          )}
                          Save Changes
                        </Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>

              {/* Activity Card */}
              <Card>
                <CardHeader>
                  <CardTitle>Activity</CardTitle>
                  <CardDescription>
                    Your recent activity and stats
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium mb-3">
                        Recent Activity
                      </h3>
                      <div className="space-y-4">
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5"></div>
                          <div>
                            <p className="text-sm">Profile updated</p>
                            <p className="text-xs text-muted-foreground">
                              2 days ago
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5"></div>
                          <div>
                            <p className="text-sm">Logged in from new device</p>
                            <p className="text-xs text-muted-foreground">
                              5 days ago
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5"></div>
                          <div>
                            <p className="text-sm">Account created</p>
                            <p className="text-xs text-muted-foreground">
                              {formatDate(userData.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and authentication
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-6">
                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Lock className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium">Password</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Change your password to keep your account secure
                      </p>
                      <Button variant="outline">Change Password</Button>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 rounded-lg border bg-card">
                    <div className="p-2 rounded-full bg-primary/10 text-primary">
                      <Shield className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-medium">
                        Two-Factor Authentication
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add an extra layer of security to your account
                      </p>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                  </div>

                  <AlertDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                  >
                    <AlertDialogTrigger asChild>
                      <div className="flex items-start gap-4 p-4 rounded-lg border border-destructive/30 bg-destructive/5">
                        <div className="p-2 rounded-full bg-destructive/10 text-destructive">
                          <AlertTriangle className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-base font-medium text-destructive">
                            Danger Zone
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            Permanently delete your account and all of your data
                          </p>
                          <Button variant="destructive">Delete Account</Button>
                        </div>
                      </div>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently
                          delete your account and remove all of your data from
                          our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          {isLoading ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : null}
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sessions</CardTitle>
                  <CardDescription>Manage your active sessions</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <span className="font-medium text-sm">
                            Current Session
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Active
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Chrome on Windows
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active: Just now
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border bg-card">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-gray-500"></div>
                          <span className="font-medium text-sm">
                            Mobile Session
                          </span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          Inactive
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">
                        Safari on iPhone
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last active: 2 days ago
                      </p>
                    </div>

                    <Button variant="outline" size="sm" className="w-full mt-2">
                      Log Out All Other Sessions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
